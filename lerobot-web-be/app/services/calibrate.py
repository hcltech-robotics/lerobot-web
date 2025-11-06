import os
import pty
import sys
import threading

from ..models.calibrate import CalibrationParams, RobotKind
from ..utils.robots import configure_follower, configure_leader

enter_flag = False
primary_file_descriptor, secondary_file_descriptor = pty.openpty()
sys.stdin = os.fdopen(secondary_file_descriptor)


def start_calibration(params: CalibrationParams):
    robotId = params.robot_id
    if params.robot_kind == RobotKind.follower:
        robot = configure_follower(False, {"robot_id": robotId}, params.robot_type)
    else:
        robot = configure_leader(False, {"robot_id": robotId}, params.robot_type)
    try:
        robot.connect(calibrate=False)
        t = threading.Thread(target=robot.calibrate, daemon=True)
        t.start()
        return {"message": "Calibration started and waiting for 'c' input and enter"}

    except Exception as e:
        print(f"[CALIBRATION FAILED] {e}")


def confirm_start():
    os.write(primary_file_descriptor, b"c\n")
    return {"message": "Calibration first step, waiting for enter"}


def confirm_enter():
    os.write(primary_file_descriptor, b"\n")
    return {"message": "Enter sent to stdin, for confirm step"}
