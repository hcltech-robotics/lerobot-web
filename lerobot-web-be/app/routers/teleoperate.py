from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from ..utilities import (
    start_teleoperate_process,
    stop_teleoperate_process,
    get_teleoperate_status
)

router = APIRouter()

class TeleoperateControlParams(BaseModel):
    mode: str = Field(..., pattern="^(start|stop|status)$")
    fps: Optional[int] = Field(30, ge=1, le=60)
    pid: Optional[int] = Field(0, ge=0)

class TeleoperateControlResponse(BaseModel):
    status: str
    pid: int
    message: str

@router.post("/teleoperate", response_model=TeleoperateControlResponse, tags=["control"])
async def control_teleoperate(params: TeleoperateControlParams):
    try:
        if params.mode == "status":
            return get_teleoperate_status()
        elif params.mode == "stop":
            return stop_teleoperate_process(params.pid)
        elif params.mode == "start":
            return start_teleoperate_process(params.fps)
    except Exception as e:
        return {"status": "error", "pid": 0, "message": str(e)}
