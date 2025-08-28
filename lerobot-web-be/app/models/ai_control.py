from enum import Enum

from pydantic import BaseModel
from typing import List
from datetime import datetime

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

class UserModelsRequest(BaseModel):
    api_key: str
    user_id: str

class UserModelsItem(BaseModel):
    id: str
    modelId: str
    private: bool
    createdAt: datetime

class UserModelsResponse(BaseModel):
    models: List[UserModelsItem]
