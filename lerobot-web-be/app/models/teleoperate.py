from enum import Enum
from typing import List

from pydantic import BaseModel


class SideEnum(str, Enum):
    left = "left"
    right = "right"


class RoleEnum(str, Enum):
    leader = "leader"
    follower = "follower"


class RobotAssignment(BaseModel):
    id: str
    side: SideEnum
    role: RoleEnum


class TeleoperateControlParams(BaseModel):
    mode: str
    robots: List[RobotAssignment]
    fps: int = 30


class TeleoperateControlResponse(BaseModel):
    status: str
    message: str


sleep_position = {
    "shoulder_pan.pos": -0.50,
    "shoulder_lift.pos": -119.8,
    "elbow_flex.pos": 70.0,
    "wrist_flex.pos": 50.0,
    "wrist_roll.pos": 0.2,
    "gripper.pos": 0.72,
}
