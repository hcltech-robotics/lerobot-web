import asyncio
import logging
from typing import Optional

from .recording_manager import RecordingManager

logger = logging.getLogger(__name__)


class RecordingService:
    def __init__(self):
        self._recording_manager: Optional[RecordingManager] = None
        self._recording_task: Optional[asyncio.Task] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    async def start_recording(
        self,
        follower_port: str,
        leader_port: str,
        repo_id: str,
        num_episodes: int,
        fps: int,
        episode_time_s: int,
        reset_time_s: int,
        task_description: str,
        display_data: bool,
        cameras: list,
    ):
        if self._recording_task and not self._recording_task.done():
            raise RuntimeError("Recording already running")

        self._recording_manager = RecordingManager(
            follower_port=follower_port,
            leader_port=leader_port,
            repo_id=repo_id,
            num_episodes=num_episodes,
            fps=fps,
            episode_time_s=episode_time_s,
            reset_time_s=reset_time_s,
            task_description=task_description,
            cameras=cameras,
        )

        # Event loop ref (because of the WebSocket streaming)
        if not self._loop:
            try:
                self._loop = asyncio.get_running_loop()
                logger.info("Event loop registered for RecordingService")
            except RuntimeError:
                self._loop = asyncio.get_event_loop()
                logger.warning("Fallback event loop created")

        self._recording_manager.attach_loop(self._loop)

        # Start recording in background
        self._recording_task = asyncio.create_task(
            self._recording_manager.start_recording()
        )
        self._recording_task.add_done_callback(
            lambda t: logger.info(
                f"Recording finished: {t.exception()}" if t.exception() else "done"
            )
        )
        logger.info("Recording started")

    async def stop_recording(self):
        if not self._recording_manager:
            return
        self._recording_manager.stop()
        if self._recording_task:
            await self._recording_task
        self._recording_task = None
        logger.info("Recording stopped")

    async def rerecord_episode(self):
        if not self._recording_manager:
            return
        self._recording_manager.rerecord()
        logger.info("Rerecord requested")

    async def exit_current_loop(self):
        if not self._recording_manager:
            return
        self._recording_manager.exit_current_loop()
        logger.info("Exit early requested")

    def get_status(self) -> dict:
        if not self._recording_manager:
            return {"is_running": False}
        return self._recording_manager.get_status()

    def get_manager(self) -> Optional[RecordingManager]:
        return self._recording_manager


recording_service = RecordingService()
