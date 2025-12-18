import asyncio
import logging
from http import HTTPStatus

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from huggingface_hub import HfApi

from ..models.record import InferenceStartParams, UserModelsRequest, UserModelsResponse
from ..services.record import recording_service
from ..utils.inference import sanitize_repo_name

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/inference/start", tags=["inference"])
async def start_record(req: InferenceStartParams):
    try:
        await recording_service.start_recording(
            follower_port=req.robot_id,
            leader_port=None,
            repo_id=f"{req.user_id}/eval_{sanitize_repo_name(req.model_id)}",
            num_episodes=req.num_episodes,
            fps=req.fps,
            episode_time_s=req.episode_time_s,
            reset_time_s=req.reset_time_s,
            task_description=req.task_description,
            cameras=req.cameras,
            robot_type=req.robot_type,
            policy_path=req.remote_model if req.remote_model else req.policy_path_local,
        )
        return {"status": "ok", "message": "Inference started"}
    except Exception as e:
        logger.exception("Failed to start inference")
        mgr = recording_service.get_manager()
        if mgr:
            asyncio.create_task(mgr._broadcast({"phase": "error", "message": str(e)}))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/inference/stop", tags=["inference"])
async def stop_record():
    await recording_service.stop_recording()
    return {"status": "ok", "message": "Recording stopped"}


@router.post("/user-models", response_model=UserModelsResponse, tags=["status"])
def list_user_models(req: UserModelsRequest):
    try:
        hf_api = HfApi(token=req.api_key)
        models_list = hf_api.list_models(author=req.user_id)
        models = [
            {
                "modelId": m.modelId,
                "id": m._id,
                "private": m.private,
                "createdAt": m.created_at,
            }
            for m in models_list
        ]
    except Exception as e:
        logger.exception("Failed to list user models")
        status_code = getattr(
            getattr(e, "response", None), "status_code", HTTPStatus.BAD_GATEWAY
        )
        raise HTTPException(
            status_code=status_code, detail="Failed to list user models"
        )
    return {"models": models}


@router.websocket("/record/ws")
async def record_ws(ws: WebSocket):
    """
    WebSocket stream the progress/state data.
    """
    await ws.accept()

    manager = recording_service.get_manager()
    if not manager:
        await ws.close()
        return

    async def send_msg(data):
        await ws.send_json(data)

    await manager.register_client(send_msg)

    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        await manager.unregister_client(send_msg)
