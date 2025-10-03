from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from datetime import datetime


class CameraConfig(BaseModel):
    name: str
    camera_id: int
    width: int = 640
    height: int = 480
    fps: int = 30


class AIControlParams(BaseModel):
    policy_type: str
    model_id: str
    robot_port: str
    hf_token: str = ""
    fps: int = 10
    repeat_count: int = 0
    retry_count: int = 0
    cameras: List[CameraConfig]


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
