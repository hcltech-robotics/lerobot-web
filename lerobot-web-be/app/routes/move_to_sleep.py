import logging
from time import sleep

from fastapi import APIRouter, HTTPException
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from pydantic import BaseModel

from ..utils.robots import configure_follower
from ..utils.serial_prefixes import get_serial_prefixes

router = APIRouter()
logger = logging.getLogger(__name__)


class MoveToSleepResponse(BaseModel):
    status: str
    message: str

class MoveToSleepRequest(BaseModel):
    follower_id: str


@router.post("/move_to_sleep", response_model=MoveToSleepResponse, tags=["control"])
def move_to_sleep(params: MoveToSleepRequest):
    robot = None

    try:
        prefixes = get_serial_prefixes(params.follower_id)
        config = SO100FollowerConfig(
            port=f"{prefixes[0]}{params.follower_id}", use_degrees=True
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
        raise HTTPException(status_code=500, detail=f"Failed to move to sleep: {e}")

    finally:
        sleep(1)
        try:
            if robot and robot.is_connected:
                robot.disconnect()
        except Exception:
            logger.exception("Failed to disconnect in move_to_sleep finally")
            raise HTTPException(
                status_code=500, detail=f"Failed to disconect the follower arm"
            )

    return {"status": "ok", "message": "Robot arm moved to sleep"}
