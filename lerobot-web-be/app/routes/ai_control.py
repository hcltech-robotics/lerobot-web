import logging

from fastapi import APIRouter

from ..models.ai_control import AIControlParams, AIControlResponse
from ..services.ai_control import ai_control_manager

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/ai-control/start", response_model=AIControlResponse, tags=["control"])
async def ai_control_start(params: AIControlParams):
    result = await ai_control_manager.start(params)
    return AIControlResponse(**result)


@router.post("/ai-control/stop", response_model=AIControlResponse, tags=["control"])
async def ai_control_stop():
    result = await ai_control_manager.stop()
    return AIControlResponse(**result)
