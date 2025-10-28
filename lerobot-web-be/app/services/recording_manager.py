import asyncio
import logging
import threading
import time
from collections.abc import Mapping

import numpy as np
from lerobot.cameras.configs import CameraConfig
from lerobot.cameras.opencv.configuration_opencv import OpenCVCameraConfig
from lerobot.datasets.lerobot_dataset import LeRobotDataset
from lerobot.datasets.utils import hw_to_dataset_features
from lerobot.processor.factory import make_default_processors
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from lerobot.scripts.lerobot_record import record_loop
from lerobot.teleoperators.so100_leader.config_so100_leader import SO100LeaderConfig
from lerobot.teleoperators.so100_leader.so100_leader import SO100Leader
from lerobot.utils import visualization_utils as viz
from lerobot.utils.control_utils import init_keyboard_listener
from lerobot.utils.utils import log_say
from lerobot.utils.visualization_utils import init_rerun

from ..utils.serial_prefixes import get_serial_prefixes

logger = logging.getLogger(__name__)


class RecordingManager:
    def __init__(
        self,
        follower_port: str,
        leader_port: str,
        repo_id: str,
        cameras: list[OpenCVCameraConfig],
        num_episodes: int = 5,
        fps: int = 30,
        episode_time_s: int = 60,
        reset_time_s: int = 10,
        task_description: str = "Task",
        display_data: bool = True,
    ):
        self.num_episodes = num_episodes
        self.fps = fps
        self.episode_time_s = episode_time_s
        self.reset_time_s = reset_time_s
        self.task_description = task_description
        self.repo_id = repo_id
        self.display_data = display_data

        self.stop_recording = False
        self.rerecord_episode = False
        self.exit_early = False
        self._episode_idx = 0
        self._is_running = False
        self._episode_start_time: float = 0.0
        self._current_episode_duration: int = 0
        self._in_reset = False
        self._reset_start_time = 0.0

        self._loop = None  # attach it later
        self._clients = set()  # support multiple WebSocket client

        # Create robot and teleoperator configs
        camera_config: Mapping[str, CameraConfig] = {
            "arm": cameras[1],
        }

        prefixes = get_serial_prefixes()

        self.robot_config = SO100FollowerConfig(
            port=f"{prefixes[0]}{follower_port}",
            id="left_follower_arm",
            cameras=camera_config,
        )
        self.teleop_config = SO100LeaderConfig(
            port=f"{prefixes[0]}{leader_port}",
            id="left_leader_arm"
        )

        self.robot = SO100Follower(self.robot_config)
        self.teleop = SO100Leader(self.teleop_config)

        # Dataset setup
        action_features = hw_to_dataset_features(self.robot.action_features, "action")  # type: ignore
        obs_features = hw_to_dataset_features(
            self.robot.observation_features, "observation"
        )
        dataset_features = {**action_features, **obs_features}

        self.dataset = LeRobotDataset.create(
            repo_id=self.repo_id,
            fps=fps,
            features=dataset_features,
            robot_type=self.robot.name,
            use_videos=True,
            image_writer_threads=4,
        )
        self.dataset.start_image_writer(num_threads=4)

        # Keyboard + visualization
        self._listener, self._events = init_keyboard_listener()
        init_rerun(session_name="recording")

    # --- Public control API ---

    def attach_loop(self, loop: asyncio.AbstractEventLoop):
        self._loop = loop

    def stop(self):
        self.stop_recording = True

    def rerecord(self):
        self.rerecord_episode = True

    def exit_current_loop(self):
        self.exit_early = True

    # --- WebSocket handling ---

    async def register_client(self, ws_send):
        self._clients.add(ws_send)
        logger.info(f"WebSocket client connected. Total: {len(self._clients)}")

    async def unregister_client(self, ws_send):
        self._clients.discard(ws_send)
        logger.info(f"WebSocket client disconnected. Total: {len(self._clients)}")

    def _threadsafe_broadcast(self, data: dict):
        """A recording threadből thread-safe broadcast"""
        if not self._loop:
            return
        for client in list(self._clients):
            asyncio.run_coroutine_threadsafe(client(data), self._loop)

    async def _stream_status(self, ws_send):
        """Egyedi kliens stream (új csatlakozónál hívódik)"""
        await self.register_client(ws_send)
        try:
            while self._is_running and not self.stop_recording:
                data = self.get_status()
                print(data)
                await ws_send(data)
                await asyncio.sleep(1 / self.fps)
        except Exception as e:
            print(f"Websocket disconnected: {e}")

        finally:
            await self.unregister_client(ws_send)

    # --- Recording logic (thread) ---

    async def start_recording(self):
        self.robot.connect()
        self.teleop.connect()
        self._episode_idx = 0
        self._is_running = True
        teleop_action_processor, robot_action_processor, robot_observation_processor = (
            make_default_processors()
        )

        def run():
            try:
                for ep in range(self.num_episodes):
                    if self.stop_recording:
                        break
                    self._episode_start_time = time.time()
                    self._current_episode_duration = self.episode_time_s
                    self._threadsafe_broadcast(
                        {"type": "episode_start", "episode_idx": self._episode_idx}
                    )
                    print("RECORD STARTED")

                    record_loop(
                        self.robot,
                        self._events,
                        self.fps,
                        teleop_action_processor,
                        robot_action_processor,
                        robot_observation_processor,
                        self.dataset,
                        self.teleop,
                        None,
                        None,
                        None,
                        self.episode_time_s,
                        self.task_description,
                        self.display_data,
                    )

                    if self.stop_recording:
                        break

                    # Reset
                    self._in_reset = True
                    self._reset_start_time = time.time()

                    self._threadsafe_broadcast(
                        {"type": "reset_start", "episode_idx": self._episode_idx}
                    )
                    record_loop(
                        self.robot,
                        self._events,
                        self.fps,
                        teleop_action_processor,
                        robot_action_processor,
                        robot_observation_processor,
                        None,
                        self.teleop,
                        None,
                        None,
                        None,
                        self.reset_time_s,
                        self.task_description,
                        True,
                    )
                    self._in_reset = False
                    self._reset_start_time = 0.0
                    self._threadsafe_broadcast(
                        {"type": "reset_end", "episode_idx": self._episode_idx}
                    )

                    self.dataset.save_episode()
                    self._episode_idx += 1

                self._threadsafe_broadcast({"type": "recording_end"})
            finally:
                print("DISCONECTED?????")

                self.robot.disconnect()
                self.teleop.disconnect()
                if self._listener:
                    self._listener.stop()
                self._is_running = False

        threading.Thread(target=run, daemon=True).start()

    def get_status(self) -> dict:
        time_left = 0
        if (
            self._is_running
            and not self.stop_recording
            and self._episode_start_time > 0
        ):
            if self._in_reset and self._reset_start_time > 0:
                elapsed = time.time() - self._reset_start_time
                time_left = max(0, self.reset_time_s - int(elapsed))
            else:
                elapsed = time.time() - self._episode_start_time
                time_left = max(0, self._current_episode_duration - int(elapsed))

        return {
            "is_running": self._is_running and not self.stop_recording,
            "current_episode": self._episode_idx,
            "total_episodes": self.num_episodes,
            "episode_start_time": self._episode_start_time,
            "time_left_s": time_left,
            "reset_time_s": self.reset_time_s,
            "in_reset": self._in_reset,
            "episodes_left": max(0, self.num_episodes - (self._episode_idx + 1)),
        }
