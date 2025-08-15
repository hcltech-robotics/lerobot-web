import os
import pty
import sys
import threading

from fastapi.responses import JSONResponse
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from lerobot.teleoperators.so100_leader import SO100Leader, SO100LeaderConfig

from ..models.calibrate import CalibrationParams, RobotKind

enter_flag = False
primary_file_descriptor, secondary_file_descriptor = pty.openpty()
sys.stdin = os.fdopen(secondary_file_descriptor)


def start_calibration(params: CalibrationParams):
    rid = params.robot_id
    port = f"/dev/tty.usbmodem{rid}"
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
        return JSONResponse(
            content={
                "message": "Calibration started and waiting for 'c' input and enter"
            }
        )

    except Exception as e:
        print(f"[CALIBRATION FAILED] {e}")
    finally:
        robot.disconnect()


def confirm_start():
    os.write(primary_file_descriptor, b"c\n")
    return JSONResponse(
        content={"message": "Calibration first step, waiting for enter"}
    )


def confirm_enter():
    os.write(primary_file_descriptor, b"\n")
    return JSONResponse(content={"message": "Enter sent to stdin, for confirm step"})
