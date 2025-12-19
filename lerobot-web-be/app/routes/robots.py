from fastapi import APIRouter
from pydantic import BaseModel

from ..models.robots import RobotType
from ..utils.robots import find_serial_ids

router = APIRouter()


class GetRobotsParam(BaseModel):
    robot_type: RobotType


@router.post("/robots", tags=["status"])
async def get_available_robots(params: GetRobotsParam):
    """
    Rerecord current episode.
    """
    ids = await find_serial_ids()
    return ids
