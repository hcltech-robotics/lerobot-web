from fastapi import APIRouter

from ..models.calibrate import CalibrationParams
from ..services.calibrate import confirm_start, confirm_step, start_calibration

router = APIRouter()


@router.post("/calibrate/start", tags=["calibrate"])
async def start(params: CalibrationParams):
    return await start_calibration(params)


@router.post("/calibrate/confirm_calibration_start", tags=["calibrate"])
async def confirm_calibration_start():
    return await confirm_start()


@router.post("/calibrate/confirm_calibration_step", tags=["calibrate"])
async def confirm_calibration_step():
    return await confirm_step()
