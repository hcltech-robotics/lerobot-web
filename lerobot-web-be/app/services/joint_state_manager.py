import asyncio
import time
from typing import Dict, Optional


class JointStateManager:
    """
    Central joint state broadcaster.
    Stores ONLY the latest joint state per robot.
    """

    def __init__(self):
        self._latest_state: Dict[str, dict] = {}
        self._event = asyncio.Event()

    def publish(self, robot_id: str, joint_state: dict):
        self._latest_state[robot_id] = {
            "timestamp": time.time(),
            "jointState": joint_state,
        }
        self._event.set()

    async def wait_for_update(self):
        await self._event.wait()
        self._event.clear()

    def get_latest(self, robot_id: str) -> Optional[dict]:
        return self._latest_state.get(robot_id)


joint_state_manager = JointStateManager()
