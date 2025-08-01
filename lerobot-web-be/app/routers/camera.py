from fastapi import FastAPI, WebSocket, APIRouter
import cv2
import base64
import asyncio
import time

router = APIRouter()

async def generate_frames():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("Camera cannot be opened")

    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        _, buffer = cv2.imencode('.jpg', frame)
        frame_data = base64.b64encode(buffer).decode('utf-8')
        yield frame_data
        await asyncio.sleep(0.03)

@router.websocket("/ws/video")
async def video_stream(websocket: WebSocket):
    await websocket.accept()
    async for frame in generate_frames():
        await websocket.send_text(frame)

def detect_cameras(max_devices=3):
    available = []
    for i in range(max_devices):
        cap = cv2.VideoCapture(i)
        if cap is not None and cap.read()[0]:
            available.append(i)
        cap.release()
    return available

@router.get("/list-cameras", tags=["status"])
def list_cameras():
    return {"cameras": detect_cameras()}
