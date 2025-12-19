from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from ..models.robots import RobotType


class CameraConfig(BaseModel):
    type: str
    index_or_path: int
    width: int
    height: int
    fps: int
    color_mode: Optional[str] = "rgb"
    warmup_s: int = 1
    rotation: int = 0


class RecordingStartParams(BaseModel):
    follower_port: str
    leader_port: Optional[str] = None
    repo_id: str
    num_episodes: int
    fps: int
    episode_time_s: int
    reset_time_s: int
    task_description: str
    display_data: bool = False
    cameras: list[CameraConfig]
    robot_type: RobotType
    policy_path: Optional[str] = None


class InferenceStartParams(BaseModel):
    robot_id: str
    leader_port: Optional[str] = None
    model_id: str
    remote_model: Optional[str] = None
    user_id: str
    num_episodes: int = 1
    fps: int = 30
    episode_time_s: int
    reset_time_s: int = 0
    task_description: str
    display_data: bool = False
    cameras: list[CameraConfig]
    robot_type: RobotType
    policy_path_local: Optional[str] = None


class RecordingControlResponse(BaseModel):
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


class UserModel(BaseModel):
    modelId: str
    id: str
    private: bool
    createdAt: Optional[datetime]
