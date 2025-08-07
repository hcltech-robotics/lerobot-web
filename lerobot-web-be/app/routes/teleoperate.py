import logging
import threading

from fastapi import APIRouter

from ..models.teleoperate import TeleoperateControlParams, TeleoperateControlResponse
from ..services.teleoperate import teleoperate_worker
from ..utils.teleoperation_validation_setup import validate_teleop_setup

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

        is_bi_setup, leader_map, follower_map = validate_teleop_setup(params.robots)

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
