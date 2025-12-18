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
    follower_port: str
    leader_port: Optional[str] = None
    repo_id: str
    num_episodes: int = 1
    fps: int = 30
    episode_time_s: int
    reset_time_s: int = 0
    task_description: str
    display_data: bool = False
    cameras: list[CameraConfig]
    robot_type: RobotType
    policy_path: Optional[str] = None


class RecordingControlResponse(BaseModel):
    status: str
    message: str
