from enum import Enum

from pydantic import BaseModel

from ..models.robots import RobotType


class RobotKind(str, Enum):
    follower = "follower"
    leader = "leader"


class CalibrationParams(BaseModel):
    robot_kind: RobotKind
    robot_id: str
    robot_type: RobotType
    user_input: str = ""
    robot_name: str = ""
