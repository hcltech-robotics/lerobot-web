from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from lerobot.scripts.lerobot_find_cameras import find_all_opencv_cameras

from ..models.camera import ListCamerasResponse
from ..utils.camera import detect_cameras, generate_frames

router = APIRouter()


@router.websocket("/ws/video/{camera_id}")
async def video_stream(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    try:
        async for frame in generate_frames(camera_id):
            await websocket.send_bytes(frame)
    except RuntimeError as e:
        await websocket.send_text(f"ERROR: {str(e)}")
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for camera {camera_id}")
    except Exception as e:
        await websocket.send_text(f"ERROR: Unexpected server error: {str(e)}")


@router.get("/list-cameras", response_model=ListCamerasResponse, tags=["status"])
def list_cameras():
    return {"cameras": detect_cameras()}
