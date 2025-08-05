from fastapi import FastAPI, WebSocket, APIRouter
from typing import List
from pydantic import BaseModel
import cv2
import base64
import asyncio
import time

from lerobot.find_cameras import find_all_opencv_cameras

router = APIRouter()

async def generate_frames(camera_id: int):
    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        raise RuntimeError(f"Camera {camera_id} cannot be opened")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            _, buffer = cv2.imencode('.jpg', frame)
            frame_data = base64.b64encode(buffer).decode('utf-8')
            yield frame_data
            await asyncio.sleep(0.03)  # ~30 FPS
    finally:
        cap.release()


@router.websocket("/ws/video/{camera_id}")
async def video_stream(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    try:
        async for frame in generate_frames(camera_id):
            await websocket.send_text(frame)
    except RuntimeError as e:
        # Ha nem lehet megnyitni a kamerát, hibaüzenet visszaküldése
        await websocket.send_text(f"ERROR: {str(e)}")
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for camera {camera_id}")
    except Exception as e:
        await websocket.send_text(f"ERROR: Unexpected server error: {str(e)}")

def detect_cameras(max_devices=10):
    available = []
    for i in range(max_devices):
        cap = cv2.VideoCapture(i)
        if cap is not None and cap.read()[0]:
            available.append(i)
        cap.release()
    return available

class ListCamerasResponse(BaseModel):
    cameras: List[int]

@router.get("/list-cameras", response_model=ListCamerasResponse, tags=["status"])
def list_cameras():
    return {"cameras": detect_cameras()}

@router.get("/list-cameras2", tags=["status"])
def list_cameras():
   return find_all_opencv_cameras()
