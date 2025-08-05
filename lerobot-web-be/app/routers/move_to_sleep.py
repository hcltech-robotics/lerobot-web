import logging
from time import sleep

from fastapi import APIRouter
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)


class MoveToSleepRequest(BaseModel):
    follower_id: str


@router.post("/move_to_sleep")
def move_to_sleep(params: MoveToSleepRequest):
    try:

        config = SO100FollowerConfig(
            port=f"/dev/tty.usbmodem{params.follower_id}", use_degrees=True
        )
        robot = SO100Follower(config)

        robot.connect(calibrate=False)

        middle_state = {
            "shoulder_pan.pos": -0.50,
            "shoulder_lift.pos": -119.8,
            "elbow_flex.pos": 70.0,
            "wrist_flex.pos": 50.0,
            "wrist_roll.pos": 0.2,
            "gripper.pos": 0.72,
        }

        robot.send_action(middle_state)
    except Exception as e:
        logger.error(f"Failed to move to sleep: {e}")
        return {"status": "error", "message": f"Failed to move to sleep: {e}"}
    finally:
        sleep(1)
        if robot and robot.is_connected:
            robot.disconnect()
    return {"status": "ok", "message": "Robot arm moved to sleep"}
