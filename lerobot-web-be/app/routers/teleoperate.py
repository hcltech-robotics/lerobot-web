import logging
import time
import threading

from fastapi import APIRouter
from pydantic import BaseModel, Field, validator
from typing import Optional

from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from lerobot.teleoperators.so100_leader import SO100Leader, SO100LeaderConfig
from lerobot.utils.robot_utils import busy_wait

router = APIRouter()
logger = logging.getLogger(__name__)

teleop_thread = None
stop_flag = threading.Event()

class TeleoperateControlParams(BaseModel):
    mode: str = Field(..., pattern="^(start|stop)$")
    fps: Optional[int] = Field(30, ge=1, le=60)

class TeleoperateControlResponse(BaseModel):
    status: str
    message: str

def teleoperate_worker(fps: int):
    try:
        leader_config = SO100LeaderConfig(port="/dev/tty.usbmodem5A4B0491371")
        follower_config = SO100FollowerConfig(port="/dev/tty.usbmodem58FA1019351")

        leader_arm = SO100Leader(leader_config)
        follower_arm = SO100Follower(follower_config)

        leader_arm.connect(calibrate=False)
        follower_arm.connect(calibrate=False)

        if not leader_arm.is_connected or not follower_arm.is_connected:
            raise RuntimeError("Leader or follower arm failed to connect.")

        logger.info("Teleoperation started...")

        while not stop_flag.is_set():
            t0 = time.perf_counter()

            action = leader_arm.get_action()
            follower_arm.send_action(action)

            busy_wait(max(1.0 / fps - (time.perf_counter() - t0), 0.0))

        logger.info("Teleoperation stopped by user.")

    except Exception as e:
        logger.error(f"Teleoperation failed: {e}")

    finally:
        if leader_arm.is_connected:
            leader_arm.disconnect()
        if follower_arm.is_connected:
            follower_arm.disconnect()
        logger.info("Teleoperation thread cleanup done.")

@router.post("/teleoperate", response_model=TeleoperateControlResponse, tags=["control"])
def teleoperate(params: TeleoperateControlParams):
    global teleop_thread, stop_flag

    if params.mode == "start":
        if teleop_thread and teleop_thread.is_alive():
            return {"status": "Teleoperation already running"}

        stop_flag.clear()
        teleop_thread = threading.Thread(target=teleoperate_worker, args=(params.fps))
        teleop_thread.start()
        return {"status": "Teleoperation started"}

    elif params.mode == "stop":
        if teleop_thread and teleop_thread.is_alive():
            stop_flag.set()
            teleop_thread.join()
            return {"status": "Teleoperation stopped"}
        else:
            return {"status": "Teleoperation not running"}
