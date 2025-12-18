import logging
import os
import re
import ast
from typing import AsyncIterator

from app.config import Settings
from app.models.groot import GrootRequest, GrootStatusResponse
from app.utils.serial_prefixes import get_serial_prefixes
from app.services.joint_state_manager import joint_state_manager
from app.utils.joint_state import remap_keys_for_client_and_convert_to_deg

logger = logging.getLogger(__name__)


class GrootAlreadyRunningError(Exception):
    """Raised when trying to start Groot while it is already running."""


class GrootStartError(Exception):
    """Raised when Groot could not be started."""


class GrootService:
    def __init__(self, process_manager, settings: Settings):
        self._manager = process_manager
        self._settings = settings
        self._robot_port = ""

    def status(self) -> GrootStatusResponse:
        is_running = self._manager.is_running()
        pid = self._manager.proc.pid if is_running else None
        return GrootStatusResponse(running=is_running, pid=pid)

    async def start(self, req: GrootRequest) -> int:
        if self._manager.is_running():
            raise GrootAlreadyRunningError("Groot process already running")

        self._robot_port = req.robot_port
        prefixes = get_serial_prefixes(req.robot_port)
        prefixed_robot_port = f"{prefixes[0]}{req.robot_port}"
        args = [
            self._settings.python_bin,
            self._settings.eval_script,
            f"--robot.type={req.robot_type}_follower",
            f"--robot.port={prefixed_robot_port}",
            "--robot.id=hcltech_lerobot_follower_arm_left",
            "--policy_host=127.0.0.1",
            "--show_images=False",
            "--action_horizon=16",
            "--use_action_smoothing=True",
            "--smoothing_alpha=0.1",
            f"--lang_instruction={req.lang_instruction}",
            f'--robot.cameras="{self._settings.camera_paths}"',
        ]

        env = os.environ.copy()

        try:
            logger.info("Starting Groot process with args: %s", args)
            pid = await self._manager.start(
                args,
                cwd=self._settings.eval_workdir,
                env=env,
            )
            return pid
        except Exception as exc:
            logger.exception("Failed to start Groot process")
            raise GrootStartError("Failed to start Groot process") from exc

    async def stop(self) -> None:
        if self._manager.is_running():
            logger.info("Stopping Groot process (pid=%s)", self._manager.proc.pid)
        await self._manager.stop()

    """ async def stream_lines(self) -> AsyncIterator[str]:
        async for line in self._manager.stream_lines():
            yield line """

    async def stream_lines(self) -> AsyncIterator[str]:
        yield "Running..."
        async for line in self._manager.stream_lines():
            try:
                if "Sending action:" in line:
                    match = re.search(r"\{.*\}", line)
                    if match:
                        obj_str = match.group(0)
                        action_dict = ast.literal_eval(obj_str)
                        obs = remap_keys_for_client_and_convert_to_deg(action_dict)
                        joint_state_manager.publish(self._robot_port, obs)

            except Exception:
                logger.exception("Failed to parse action line: %s", line)

            yield line
