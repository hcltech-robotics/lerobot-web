import builtins
from queue import Queue
from threading import Thread

from fastapi import HTTPException
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from lerobot.teleoperators.so100_leader import SO100Leader, SO100LeaderConfig

from ..models.calibrate import CalibrationParams, RobotKind
from ..utils.calibration import make_blocking_input

sessions = {}  # {robot_id: {"thread": Thread, "queue": Queue, "robot": robot_instance}}


def calibration_worker(robot, q: Queue, robot_id: str):
    real_input = builtins.input
    builtins.input = make_blocking_input(q)
    try:
        robot.connect(calibrate=False)
        robot.calibrate()
        robot.disconnect()
        print("[CALIBRATION DONE]")
    except Exception as e:
        print(f"[CALIBRATION FAILED] {e}")
    finally:
        builtins.input = real_input
        sessions.pop(robot_id, None)


def start_calibration(params: CalibrationParams):
    rid = params.robot_id
    if rid in sessions:
        raise HTTPException(
            status_code=400, detail="Calibration already running for this robot"
        )

    port = f"/dev/tty.usbmodem{rid}"
    if params.robot_kind == RobotKind.follower:
        config = SO100FollowerConfig(port=port)
        robot = SO100Follower(config)
    else:
        config = SO100LeaderConfig(port=port)
        robot = SO100Leader(config)

    q = Queue()
    q.put(params.user_input)
    t = Thread(target=calibration_worker, args=(robot, q, rid), daemon=True)
    sessions[rid] = {"thread": t, "queue": q, "robot": robot}
    t.start()
    return {"status": "calibration started, waiting for next step"}


def calibration_step(params: CalibrationParams):
    rid = params.robot_id
    if rid not in sessions:
        raise HTTPException(
            status_code=404, detail="No active calibration session for this robot"
        )

    q = sessions[rid]["queue"]
    user_input = ""
    if params.user_input == "":
        user_input = b"\n"
    q.put(user_input)
    return {"status": f"input '{params.user_input}' sent"}
