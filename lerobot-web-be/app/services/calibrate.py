import os
import pty
import sys
import termios
import threading

from ..models.calibrate import CalibrationParams, RobotKind
from ..utils.robots import configure_follower, configure_leader

primary_file_descriptor, secondary_file_descriptor = pty.openpty()
_robot_thread = None
_robot = None


def _redirect_stdin_to_pty():
    fd = os.open(os.ttyname(secondary_file_descriptor), os.O_RDONLY)
    sys.stdin = os.fdopen(fd, "r")


def start_calibration(params: CalibrationParams):
    global _robot, _robot_thread
    robotId = params.robot_id

    if params.robot_kind == RobotKind.follower:
        _robot = configure_follower(False, {"robot_id": robotId}, params.robot_type)
    else:
        _robot = configure_leader(False, {"robot_id": robotId}, params.robot_type)

    _robot.connect(calibrate=False)

    def run():
        _redirect_stdin_to_pty()
        _robot.calibrate()

    _robot_thread = threading.Thread(target=run, daemon=True)
    _robot_thread.start()

    return {"message": "Calibration started, waiting for 'c' + ENTER"}


def confirm_start():
    termios.tcflush(primary_file_descriptor, termios.TCIFLUSH)
    os.write(primary_file_descriptor, b"c\n")
    return {"message": "Calibration started"}


def confirm_enter():
    termios.tcflush(primary_file_descriptor, termios.TCIFLUSH)
    os.write(primary_file_descriptor, b"\n")
    return {"message": "Step confirmed"}
