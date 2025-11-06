import logging

from fastapi import APIRouter

from ..models.teleoperate import TeleoperateControlParams, TeleoperateControlResponse
from ..services.teleoperate import teleop_manager
from ..utils.teleoperation_validation_setup import validate_teleop_setup

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/teleoperate/start", response_model=TeleoperateControlResponse, tags=["control"]
)
async def teleoperate_start(params: TeleoperateControlParams):
    is_bi_setup, leader_map, follower_map = validate_teleop_setup(params.robots)

    await teleop_manager.start_teleoperation(
        params.fps, leader_map, follower_map, is_bi_setup, params.robot_type
    )
    return {"status": "ok", "message": "Teleoperation started"}


@router.post(
    "/teleoperate/stop", response_model=TeleoperateControlResponse, tags=["control"]
)
async def teleoperate_stop():
    await teleop_manager.stop_teleoperation()
    return {"status": "ok", "message": "Teleoperation stopped"}
