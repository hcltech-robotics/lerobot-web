import asyncio
import logging

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from ..models.record import InferenceStartParams
from ..services.record import recording_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/inference/start")
async def start_record(req: InferenceStartParams):
    try:
        await recording_service.start_recording(
            follower_port=req.follower_port,
            leader_port=None,
            repo_id=req.repo_id,
            num_episodes=req.num_episodes,
            fps=req.fps,
            episode_time_s=req.episode_time_s,
            reset_time_s=req.reset_time_s,
            task_description=req.task_description,
            cameras=req.cameras,
            robot_type=req.robot_type,
            policy_path=req.policy_path,
        )
        return {"message": "Inference started"}
    except Exception as e:
        logger.exception("Failed to start inference")
        mgr = recording_service.get_manager()
        if mgr:
            asyncio.create_task(mgr._broadcast({"phase": "error", "message": str(e)}))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/inference/stop")
async def stop_record():
    await recording_service.stop_recording()
    return {"message": "Recording stopped"}


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
