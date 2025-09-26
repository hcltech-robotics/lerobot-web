import logging

from fastapi import APIRouter, HTTPException
from huggingface_hub import HfApi

from ..models.ai_control import AIControlParams, AIControlResponse, UserModelsRequest, UserModelsResponse
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

@router.post("/user-models", response_model=UserModelsResponse, tags=["status"])
def list_user_models(req: UserModelsRequest):
    try:
        hf_api = HfApi(token=req.api_key)
        models_list = hf_api.list_models(author=req.user_id)
        models = [{"modelId": m.modelId, "id": m._id, "private": m.private, "createdAt": m.created_at} for m in models_list]
    except Exception as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    return {"models": models}
