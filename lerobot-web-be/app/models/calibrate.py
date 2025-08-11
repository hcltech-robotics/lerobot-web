from enum import Enum

from pydantic import BaseModel


class RobotKind(str, Enum):
    follower = "follower"
    leader = "leader"


class CalibrationParams(BaseModel):
    robot_kind: RobotKind
    robot_id: str
    user_input: str = ""
