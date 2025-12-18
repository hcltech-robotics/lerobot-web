import os
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    camera_width: int = Field(default=640, alias="CAMERA_WIDTH")
    camera_height: int = Field(default=480, alias="CAMERA_HEIGHT")
    camera_fps: int = Field(default=15, alias="CAMERA_FPS")
    camera_paths: str = Field(
        default="", 
        alias="CAMERA_PATHS"
    )

    python_bin: str = Field(default="python", alias="PYTHON_BIN")
    eval_script: str = Field(default="", alias="EVAL_SCRIPT")
    eval_workdir: str = Field(
        default_factory=os.getcwd,
        alias="EVAL_WORKDIR",
    )


def get_settings() -> Settings:
    return Settings()
