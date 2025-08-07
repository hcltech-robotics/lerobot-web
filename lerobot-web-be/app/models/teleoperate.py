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
