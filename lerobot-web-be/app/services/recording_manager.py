import asyncio
import concurrent.futures
import logging
import threading
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from lerobot.configs.policies import PreTrainedConfig
from lerobot.datasets.lerobot_dataset import LeRobotDataset
from lerobot.datasets.pipeline_features import (
    aggregate_pipeline_dataset_features,
    create_initial_features,
)
from lerobot.datasets.utils import combine_feature_dicts
from lerobot.policies.factory import make_policy, make_pre_post_processors
from lerobot.processor import make_default_processors
from lerobot.processor.rename_processor import rename_stats

from ..models.robots import RobotType
from ..utils.record_loop_callback import record_loop
from ..utils.robots import configure_follower, configure_leader

logger = logging.getLogger(__name__)


class RecordingManager:
    def __init__(
        self,
        *,
        follower_port: str,
        leader_port: Optional[str],
        repo_id: str,
        cameras: list,
        num_episodes: int,
        fps: int,
        episode_time_s: float,
        reset_time_s: float,
        task_description: str,
        robot_type: RobotType,
        policy_path: Optional[str] = None,
        rename_map: Optional[dict[str, str]] = None,
        push_to_hub: bool = False,
    ):
        self._executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        self._future = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._clients = set()

        self.repo_id = repo_id
        self.fps = fps
        self.num_episodes = num_episodes
        self.episode_time_s = episode_time_s
        self.reset_time_s = reset_time_s
        self.task_description = task_description
        self.policy_path = policy_path
        self.rename_map = rename_map or {}
        self.push_to_hub = push_to_hub

        self._events = {
            "exit_early": False,
            "rerecord_episode": False,
            "stop_recording": False,
        }
        self._events_lock = threading.Lock()

        self._is_running = False
        self.phase = "idle"
        self._progress: Dict[str, Any] = {}
        self.follower_port = follower_port

        self.robot = configure_follower(
            False,
            {"follower_port": follower_port},
            robot_type,
            camera_config={"arm": cameras[0]},
        )

        self.teleop = None
        if leader_port:
            self.teleop = configure_leader(
                False, {"leader_port": leader_port}, robot_type
            )
        (
            self.teleop_action_processor,
            self.robot_action_processor,
            self.robot_observation_processor,
        ) = make_default_processors()

        dataset_features = combine_feature_dicts(
            aggregate_pipeline_dataset_features(
                pipeline=self.teleop_action_processor,
                initial_features=create_initial_features(
                    action=self.robot.action_features
                ),
                use_videos=True,
            ),
            aggregate_pipeline_dataset_features(
                pipeline=self.robot_observation_processor,
                initial_features=create_initial_features(
                    observation=self.robot.observation_features
                ),
                use_videos=True,
            ),
        )

        self.dataset = LeRobotDataset.create(
            repo_id=self.repo_id,
            fps=self.fps,
            robot_type=self.robot.name,
            features=dataset_features,
            use_videos=True,
            image_writer_threads=4 * len(getattr(self.robot, "cameras", []) or [1]),
        )

        self.policy = None
        self.preprocessor = None
        self.postprocessor = None

        if self.policy_path:
            cfg = PreTrainedConfig.from_pretrained(self.policy_path)
            cfg.pretrained_path = self.policy_path

            self.policy = make_policy(cfg, ds_meta=self.dataset.meta)

            self.preprocessor, self.postprocessor = make_pre_post_processors(
                policy_cfg=cfg,
                pretrained_path=cfg.pretrained_path,
                dataset_stats=rename_stats(self.dataset.meta.stats, self.rename_map),
                preprocessor_overrides={
                    "device_processor": {"device": cfg.device},
                    "rename_observations_processor": {"rename_map": self.rename_map},
                },
            )

    # ---------- WS ----------
    def attach_loop(self, loop: asyncio.AbstractEventLoop):
        self._loop = loop

    async def register_client(self, ws_send):
        self._clients.add(ws_send)

    async def unregister_client(self, ws_send):
        self._clients.discard(ws_send)

    async def _broadcast(self, msg: dict):
        msg = dict(msg)
        msg["timestamp"] = datetime.now(timezone.utc).isoformat()
        for ws in list(self._clients):
            try:
                await ws(msg)
            except Exception:
                self._clients.discard(ws)

    def _threadsafe_broadcast(self, msg: dict):
        if not self._loop:
            return
        asyncio.run_coroutine_threadsafe(self._broadcast(msg), self._loop)

    # ---------- controls ----------
    def stop(self):
        with self._events_lock:
            self._events["stop_recording"] = True

    def exit_current_loop(self):
        with self._events_lock:
            self._events["exit_early"] = True

    def rerecord(self):
        with self._events_lock:
            self._events["rerecord_episode"] = True

    # ---------- main ----------
    async def start_recording(self):
        if self._is_running:
            raise RuntimeError("Already running")

        # reset events
        with self._events_lock:
            for k in self._events:
                self._events[k] = False

        self._is_running = True
        loop = asyncio.get_running_loop()

        def progress_cb(p: dict):
            # thread → event loop WS
            self._threadsafe_broadcast(p)

        def run():
            try:
                self.robot.connect(calibrate=False)
                if self.teleop is not None:
                    self.teleop.connect(calibrate=False)

                recorded = 0
                while (
                    recorded < self.num_episodes and not self._events["stop_recording"]
                ):
                    # RECORDING
                    self.phase = "recording"
                    record_loop(
                        robot=self.robot,
                        events=self._events,
                        fps=self.fps,
                        teleop_action_processor=self.teleop_action_processor,
                        robot_action_processor=self.robot_action_processor,
                        robot_observation_processor=self.robot_observation_processor,
                        dataset=self.dataset,
                        teleop=self.teleop,
                        policy=self.policy,
                        preprocessor=self.preprocessor,
                        postprocessor=self.postprocessor,
                        control_time_s=self.episode_time_s,
                        single_task=self.task_description,
                        phase="recording",
                        progress_cb=progress_cb,
                        current_episode=recorded + 1,
                        total_episodes=self.num_episodes,
                        follower_port=self.follower_port,
                    )

                    if self._events["rerecord_episode"]:
                        self._events["rerecord_episode"] = False
                        self._events["exit_early"] = False
                        self.dataset.clear_episode_buffer()
                        continue

                    self.dataset.save_episode()
                    recorded += 1

                    if self._events["stop_recording"]:
                        break

                    # RESETTING (skip after last episode)
                    if recorded < self.num_episodes:
                        self.phase = "resetting"
                        record_loop(
                            robot=self.robot,
                            events=self._events,
                            fps=self.fps,
                            teleop_action_processor=self.teleop_action_processor,
                            robot_action_processor=self.robot_action_processor,
                            robot_observation_processor=self.robot_observation_processor,
                            dataset=None,
                            teleop=self.teleop,
                            policy=None,
                            preprocessor=None,
                            postprocessor=None,
                            control_time_s=self.reset_time_s,
                            single_task=self.task_description,
                            phase="resetting",
                            progress_cb=progress_cb,
                            current_episode=recorded,
                            total_episodes=self.num_episodes,
                            follower_port=self.follower_port,
                        )

                self.phase = "completed"
                self._threadsafe_broadcast(
                    {
                        "phase": "completed",
                        "current_episode": recorded,
                        "total_episodes": self.num_episodes,
                        "is_running": False,
                    }
                )

            except Exception as e:
                logger.exception("Worker crashed")
                self.phase = "error"
                self._threadsafe_broadcast(
                    {"phase": "error", "message": str(e), "is_running": False}
                )
            finally:
                self._is_running = False
                try:
                    if self.teleop is not None and getattr(
                        self.teleop, "is_connected", False
                    ):
                        self.teleop.disconnect()
                except Exception:
                    logger.exception("teleop disconnect failed")
                try:
                    if getattr(self.robot, "is_connected", False):
                        self.robot.disconnect()
                except Exception:
                    logger.exception("robot disconnect failed")

        self._future = loop.run_in_executor(self._executor, run)
