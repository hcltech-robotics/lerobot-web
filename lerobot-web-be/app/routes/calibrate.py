from fastapi import APIRouter

from ..models.calibrate import CalibrationParams
from ..services.calibrate import calibration_step, start_calibration

router = APIRouter()


@router.post("/calibrate/start")
def start(params: CalibrationParams):
    return start_calibration(params)


@router.post("/calibrate/step")
def step(params: CalibrationParams):
    return calibration_step(params)
