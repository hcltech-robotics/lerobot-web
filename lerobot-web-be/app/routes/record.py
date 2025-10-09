import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..models.record import RecordingControlResponse, RecordingStartParams
from ..services.record import recording_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/record/start", response_model=RecordingControlResponse, tags=["record"])
async def start_recording(params: RecordingStartParams):
    await recording_service.start_recording(
        follower_port=params.follower_port,
        leader_port=params.leader_port,
        repo_id=params.repo_id,
        num_episodes=params.num_episodes,
        fps=params.fps,
        episode_time_s=params.episode_time_s,
        reset_time_s=params.reset_time_s,
        task_description=params.task_description,
        display_data=params.display_data,
        cameras=params.cameras,
    )
    return {"status": "ok", "message": "Recording started"}


@router.post("/record/stop", response_model=RecordingControlResponse, tags=["record"])
async def stop_recording():
    await recording_service.stop_recording()
    return {"status": "ok", "message": "Recording stopped"}


@router.post(
    "/record/rerecord", response_model=RecordingControlResponse, tags=["record"]
)
async def rerecord_episode():
    await recording_service.rerecord_episode()
    return {"status": "ok", "message": "Rerecord requested"}


@router.post("/record/exit", response_model=RecordingControlResponse, tags=["record"])
async def exit_current_loop():
    await recording_service.exit_current_loop()
    return {"status": "ok", "message": "Exit early requested"}


@router.websocket("/record/ws")
async def record_ws(websocket: WebSocket):
    await websocket.accept()

    async def ws_send(data):
        await websocket.send_json(data)

    try:
        manager = recording_service.get_manager()
        if manager and manager._is_running:
            asyncio.create_task(manager._stream_status(ws_send))
        else:
            while not (
                recording_service.get_manager()
                and recording_service.get_manager()._is_running
            ):
                await asyncio.sleep(0.2)
            manager = recording_service.get_manager()
            asyncio.create_task(manager._stream_status(ws_send))

        while True:
            await asyncio.sleep(5)

    except WebSocketDisconnect:
        logger.info("Client disconnected from /record/ws")
    except Exception as e:
        logger.error(f"Unexpected error in /record/ws: {e}")
