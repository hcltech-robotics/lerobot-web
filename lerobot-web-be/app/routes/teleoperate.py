import logging
import threading

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from models.teleoperate import (
    SideEnum,
    TeleoperateControlParams,
    TeleoperateControlResponse,
)
from services.teleoperate import teleoperate_worker

router = APIRouter()
logger = logging.getLogger(__name__)

teleop_thread = None
stop_flag = threading.Event()


@router.post(
    "/teleoperate", response_model=TeleoperateControlResponse, tags=["control"]
)
def teleoperate(params: TeleoperateControlParams):
    global teleop_thread, stop_flag

    if params.mode == "start":
        if params.mode == "start":
            # --- Validation based on robot list length ---
            robot_count = len(params.robots)
            if robot_count not in (2, 4):
                return JSONResponse(
                    status_code=400,
                    content={
                        "status": "error",
                        "message": "Expected 2 (single) or 4 (bimanual) robot assignments.",
                    },
                )

            # --- Role validation ---
            role_counts = {"leader": 0, "follower": 0}
            for r in params.robots:
                role_counts[r.role.value] += 1

            if robot_count == 2 and (
                role_counts["leader"] != 1 or role_counts["follower"] != 1
            ):
                return JSONResponse(
                    status_code=400,
                    content={
                        "status": "error",
                        "message": "Single-arm setup must have 1 leader and 1 follower.",
                    },
                )

            if robot_count == 4 and (
                role_counts["leader"] != 2 or role_counts["follower"] != 2
            ):
                return JSONResponse(
                    status_code=400,
                    content={
                        "status": "error",
                        "message": "Bi-manual setup must have 2 leaders and 2 followers.",
                    },
                )

        # --- Build leader/follower maps by side ---
        leader_map = {}
        follower_map = {}

        for robot in params.robots:
            if robot.role == "leader":
                leader_map[robot.side] = robot.id
            elif robot.role == "follower":
                follower_map[robot.side] = robot.id

        # --- Determine setup type by length ---
        is_bi_setup = set(leader_map.keys()) == {"left", "right"}

        # --- Threaded worker start ---
        stop_flag.clear()
        teleop_thread = threading.Thread(
            target=teleoperate_worker,
            args=(params.fps, leader_map, follower_map, is_bi_setup),
        )
        teleop_thread.start()

        return {"status": "ok", "message": "Teleoperation started"}

    elif params.mode == "stop":
        if teleop_thread and teleop_thread.is_alive():
            stop_flag.set()
            teleop_thread.join()
            return {"status": "ok", "message": "Teleoperation stopped"}
        return {"status": "error", "message": "Teleoperation not running"}
