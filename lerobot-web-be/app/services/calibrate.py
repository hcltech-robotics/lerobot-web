import os
import pty
import sys
import threading

from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from lerobot.teleoperators.so100_leader import SO100Leader, SO100LeaderConfig

from ..models.calibrate import CalibrationParams, RobotKind
from ..utils.serial_prefixes import get_serial_prefixes

enter_flag = False
primary_file_descriptor, secondary_file_descriptor = pty.openpty()
sys.stdin = os.fdopen(secondary_file_descriptor)


def start_calibration(params: CalibrationParams):
    robotId = params.robot_id
    prefixes = get_serial_prefixes() 
    port = f"{prefixes[0]}{robot_id}"
    if params.robot_kind == RobotKind.follower:
        config = SO100FollowerConfig(port=port)
        robot = SO100Follower(config)
    else:
        config = SO100LeaderConfig(port=port)
        robot = SO100Leader(config)
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
