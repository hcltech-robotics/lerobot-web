import asyncio
import logging
import time
from typing import Optional

from fastapi import WebSocketDisconnect
from fastapi.websockets import WebSocketState

from ..models.robots import RobotType
from ..models.teleoperate import sleep_position
from ..utils.joint_state import remap_keys_for_client_and_convert_to_deg
from ..utils.robots import configure_follower, configure_leader
from ..utils.serial_prefixes import get_serial_prefixes

logger = logging.getLogger(__name__)


class TeleoperationManager:
    def __init__(self):
        self.leader_arm = None
        self.follower_arm = None
        self.is_bi_setup = False

        self._stop_event = asyncio.Event()
        self._teleop_task: Optional[asyncio.Task] = None
        self.joint_state_queue: asyncio.Queue = asyncio.Queue(maxsize=3)

    # ---------- INIT + CONNECT ----------
    def _create_arms(
        self,
        leader_map: dict,
        follower_map: dict,
        is_bi_setup: bool,
        robot_type: RobotType,
    ):
        self.follower_arm = configure_follower(is_bi_setup, follower_map, robot_type)
        self.leader_arm = configure_leader(is_bi_setup, leader_map, robot_type)
        self.is_bi_setup = is_bi_setup

    def connect_arms(
        self,
        leader_map: dict,
        follower_map: dict,
        is_bi_setup: bool,
        robot_type: RobotType,
    ):
        self._create_arms(leader_map, follower_map, is_bi_setup, robot_type)
        if not self.follower_arm or not self.leader_arm:
            logger.error("Arms not initialized before teleopeation loop")
            return
        try:
            self.leader_arm.connect(calibrate=False)
        except Exception as e:
            logger.error(f"Error during connection to leader arm: {e}")
            return
        try:
            self.follower_arm.connect(calibrate=False)
        except Exception as e:
            logger.error(f"Error during connection to follower arm: {e}")
            return
        if not self.leader_arm.is_connected or not self.follower_arm.is_connected:
            raise RuntimeError("Leader or follower arm failed to connect.")

        logger.info("Arms connected successfully")

    def disconnect_arms(self, move_to_sleep: bool = False):
        if self.leader_arm and self.leader_arm.is_connected:
            try:
                self.leader_arm.disconnect()
            except Exception as e:
                logger.error(f"Error during connection to leader arm: {e}")

        if self.follower_arm and self.follower_arm.is_connected:
            if move_to_sleep:
                if self.is_bi_setup:
                    action_dict = {}
                    action_dict.update(
                        {f"left_{key}": value for key, value in sleep_position.items()}
                    )
                    action_dict.update(
                        {f"right_{key}": value for key, value in sleep_position.items()}
                    )
                    self.follower_arm.send_action(action_dict)
                else:
                    self.follower_arm.send_action(sleep_position)
            time.sleep(2)
            self.follower_arm.disconnect()

        self.leader_arm = None
        self.follower_arm = None
        logger.info("Arms disconnected")

    # ---------- TELEOPERATION ----------
    async def _teleoperate_loop(self, fps: int, follower_map: dict):
        logger.info("Teleoperation loop started")
        if not self.follower_arm or not self.leader_arm:
            logger.error("Arms not initialized before teleopeation loop")
            return
        try:
            while not self._stop_event.is_set():
                t0 = time.perf_counter()

                action = await asyncio.to_thread(self.leader_arm.get_action)
                await asyncio.to_thread(self.follower_arm.send_action, action)

                try:
                    if self.is_bi_setup:
                        left_action_map = {}
                        right_action_map = {}
                        prefixes = get_serial_prefixes()

                        left_arm_port = f"{prefixes[0]}{follower_map['left']}"
                        right_arm_port = f"{prefixes[0]}{follower_map['right']}"
                        for k, v in action.items():
                            if k.startswith("left_"):
                                left_action_map[k[len("left_") :]] = v
                            if k.startswith("right_"):
                                right_action_map[k[len("right_") :]] = v
                        left_obs = remap_keys_for_client_and_convert_to_deg(
                            left_action_map
                        )
                        right_obs = remap_keys_for_client_and_convert_to_deg(
                            right_action_map
                        )
                        item = {left_arm_port: left_obs, right_arm_port: right_obs}
                        self.joint_state_queue.put_nowait(item)

                    else:
                        robot_arm_port = list(follower_map.values())[0]
                        obs = remap_keys_for_client_and_convert_to_deg(action)
                        item = {robot_arm_port: obs}
                        self.joint_state_queue.put_nowait(item)
                except asyncio.QueueFull:
                    pass

                delay = max(1.0 / fps - (time.perf_counter() - t0), 0.0)
                await asyncio.sleep(delay)
        except Exception as e:
            logger.error(f"Teleoperation loop error: {e}")
        finally:
            logger.info("Teleoperation loop stopped")

    async def start_teleoperation(
        self,
        fps: int,
        leader_map: dict,
        follower_map: dict,
        is_bi_setup: bool,
        robot_type: RobotType,
    ):
        if self._teleop_task and not self._teleop_task.done():
            raise RuntimeError("Teleoperation already running")

        self.connect_arms(leader_map, follower_map, is_bi_setup, robot_type)
        self._stop_event.clear()
        self._teleop_task = asyncio.create_task(
            self._teleoperate_loop(fps, follower_map)
        )

    async def stop_teleoperation(self):
        if not self._teleop_task or not self.follower_arm:
            return

        self._stop_event.set()
        await asyncio.sleep(0.2)  # small grace time
        self.disconnect_arms(move_to_sleep=True)

        if self._teleop_task:
            await self._teleop_task
        self._teleop_task = None

    # ---------- JOINT STATE STREAM ----------
    async def stream_joint_states(self, websocket, follower_id: str, fps: int = 60):
        if not self.follower_arm or not self.follower_arm.is_connected:
            await websocket.send_json({"error": "Follower not connected"})
            await websocket.close()
            return
        try:
            while not self._stop_event.is_set():
                joint_states_map = await self.joint_state_queue.get()
                matched_state = None
                for port, obs in joint_states_map.items():
                    if follower_id in port:
                        matched_state = obs
                if matched_state is not None:
                    await websocket.send_json(
                        {
                            "timestamp": time.time(),
                            "jointState": matched_state,
                        }
                    )
                else:
                    print(
                        f"The robot_id: {follower_id} is not accessible in the joint state map"
                    )
                await asyncio.sleep(1 / fps)
        except WebSocketDisconnect:
            logger.info("WebSocket client disconnected")
            return
        except Exception as e:
            logger.error(f"Joint state stream error: {e}")
            if websocket.application_state == WebSocketState.CONNECTED:
                await websocket.close()


teleop_manager = TeleoperationManager()
