from enum import Enum

from pydantic import BaseModel


class AIControlMode(str, Enum):
    start = "start"
    stop = "stop"


class AIControlParams(BaseModel):
    mode: AIControlMode
    model_name: str  # pl. "tfoldi/act_so100_test"
    robot_id: str
    fps: int = 30


class AIControlResponse(BaseModel):
    status: str
    message: str
