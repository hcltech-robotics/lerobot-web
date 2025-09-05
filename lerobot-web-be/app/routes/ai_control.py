import logging
import threading
import requests

from fastapi import APIRouter, HTTPException
from huggingface_hub import HfApi

from ..models.ai_control import AIControlParams, AIControlResponse, UserModelsRequest, UserModelsResponse
from ..services.ai_control import policy_worker

router = APIRouter()
logger = logging.getLogger(__name__)
policy_thread = None
stop_flag = threading.Event()


@router.post("/ai_control", response_model=AIControlResponse, tags=["control"])
def control_policy(params: AIControlParams):
    if params.mode == "start":
        stop_flag.clear()
        policy_thread = threading.Thread(
            target=policy_worker,
            args=(params.model_name, params.robot_id, params.fps),
        )
        policy_thread.start()
        return {"status": "ok", "message": f"Policy '{params.model_name}' started"}

    elif params.mode == "stop":
        if policy_thread and policy_thread.is_alive():
            stop_flag.set()
            policy_thread.join()
            return {"status": "ok", "message": "Policy stopped"}
        return {"status": "error", "message": "Policy is not running"}


@router.post("/get-user-models", response_model=UserModelsResponse, tags=["status"])
def list_user_models(req: UserModelsRequest):
    try:
        hf_api = HfApi(token=req.api_key)
        models_list = hf_api.list_models(author=req.user_id)
        models = [{"modelId": m.modelId, "id": m._id, "private": m.private, "createdAt": m.created_at} for m in models_list]
    except Exception as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    return {"models": models}
