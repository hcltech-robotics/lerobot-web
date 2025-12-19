import os
import pty
import sys
import termios
import threading
from typing import Optional

from ..models.calibrate import CalibrationParams, RobotKind
from ..utils.robots import configure_follower, configure_leader

_primary_fd, _secondary_fd = pty.openpty()

_robot = None
_robot_thread: Optional[threading.Thread] = None


def _redirect_stdin_to_pty():
    """
    Redirect stdin so that robot.calibrate() reads from our PTY.
    """
    fd = os.open(os.ttyname(_secondary_fd), os.O_RDONLY)
    sys.stdin = os.fdopen(fd, "r")


async def start_calibration(params: CalibrationParams):
    """
    Step 0 (UI):
    - create robot
    - connect
    - start calibrate() in background
    :exclamation: DOES NOT send 'c' yet
    """
    global _robot, _robot_thread

    if params.robot_kind == RobotKind.follower:
        _robot = configure_follower(
            False,
            {"robot_id": params.robot_id},
            params.robot_type,
        )
    else:
        _robot = configure_leader(
            False,
            {"robot_id": params.robot_id},
            params.robot_type,
        )

    _robot.connect(calibrate=False)

    def run():
        _redirect_stdin_to_pty()
        _robot.calibrate()

    _robot_thread = threading.Thread(target=run, daemon=True)
    _robot_thread.start()

    return {"message": "Calibration initialized. Waiting for 'c'."}


async def confirm_start():
    """
    UI Step 1:
    Send 'c' + ENTER
    """
    termios.tcflush(_primary_fd, termios.TCIFLUSH)
    os.write(_primary_fd, b"c\n")
    return {"message": "'c' sent"}


async def confirm_step():
    """
    UI Step 2 & 3:
    Send ENTER
    """
    termios.tcflush(_primary_fd, termios.TCIFLUSH)
    os.write(_primary_fd, b"\n")
    return {"message": "Step confirmed"}
