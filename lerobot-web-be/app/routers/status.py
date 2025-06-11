from fastapi import APIRouter
from pydantic import BaseModel
from ..utilities import check_calibration_file_exists

router = APIRouter()

class StatusResponse(BaseModel):
    calibration: bool

@router.get("/status", response_model=StatusResponse, tags=["status"])
async def get_status():
    return StatusResponse(calibration=check_calibration_file_exists())
