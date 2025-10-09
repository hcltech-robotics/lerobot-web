from typing import List, Optional

from pydantic import BaseModel


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
    leader_port: str
    repo_id: str
    num_episodes: int
    fps: int
    episode_time_s: int
    reset_time_s: int
    task_description: str
    display_data: bool = True
    cameras: list[CameraConfig]


class RecordingControlResponse(BaseModel):
    status: str
    message: str
