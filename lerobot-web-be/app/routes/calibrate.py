from fastapi import APIRouter

from ..models.calibrate import CalibrationParams
from ..services.calibrate import confirm_enter, confirm_start, start_calibration

router = APIRouter()


@router.post("/calibrate/start", tags=["calibrate"])
def start(params: CalibrationParams):
    return start_calibration(params)


@router.post("/calibrate/confirm_calibration_start", tags=["calibrate"])
async def confirm_calibration_start():
    return confirm_start()


@router.post("/calibrate/confirm_calibration_step", tags=["calibrate"])
async def confirm_calibration_step():
    return confirm_enter()
