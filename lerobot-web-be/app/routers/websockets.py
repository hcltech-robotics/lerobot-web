from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio
import base64
import cv2
from ..utilities import get_robot_joint_state

router = APIRouter()

@router.websocket("/ws/joint_state")
async def websocket_joint_state(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            joint_state = get_robot_joint_state()
            await websocket.send_text(json.dumps(joint_state))
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        print("Client disconnected from joint state")

@router.websocket("/ws/video")
async def websocket_video_feed(websocket: WebSocket):
    cap = cv2.VideoCapture(0)
    await websocket.accept()
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            _, buffer = cv2.imencode('.jpg', frame)
            jpg_as_text = base64.b64encode(buffer).decode('utf-8')
            await websocket.send_text(json.dumps({
                "type": "camera_frame", 
                "data": jpg_as_text
            }))
            await asyncio.sleep(1 / 30)  # 30 fps
    except WebSocketDisconnect:
        print("Client disconnected from camera stream")
    except Exception as e:
        print(f"Error: {e}")