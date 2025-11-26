from typing import Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi import status
import logging

from ..models.camera import ListCamerasResponse
from ..utils.camera import detect_cameras, CameraStream

router = APIRouter()
logger = logging.getLogger(__name__)
camera_streams: Dict[int, CameraStream] = {}


@router.get("/list-cameras", response_model=ListCamerasResponse, tags=["status"])
def list_cameras() -> ListCamerasResponse:
    return {"cameras": detect_cameras()}


@router.websocket("/ws/video/{camera_id}")
async def video_stream(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    logger.info("WebSocket connected for camera %s", camera_id)

    if camera_id not in camera_streams:
        try:
            camera_streams[camera_id] = CameraStream(camera_id)
        except RuntimeError as e:
            await websocket.send_text(f"ERROR: {str(e)}")
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
            return

    stream = camera_streams[camera_id]

    try:
        async for frame in stream.subscribe():
            await websocket.send_bytes(frame)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected for camera %s", camera_id)
    except RuntimeError as e:
        logger.exception("Runtime error on camera %s: %s", camera_id, e)
        await websocket.send_text(f"ERROR: {str(e)}")
    except Exception as e:
        logger.exception("Unexpected error on camera %s: %s", camera_id, e)
        await websocket.send_text(f"ERROR: Unexpected server error: {str(e)}")
