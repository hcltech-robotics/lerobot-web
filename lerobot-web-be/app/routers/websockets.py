from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
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
        print("Client disconnected from ws/joint_state")

@router.websocket("/ws/video")
async def websocket_video_feed(websocket: WebSocket, camera_ids: str = Query(...)):
    await websocket.accept()
    try:
        ids = [int(camera_id) for camera_id in camera_ids.split(",")]
    except ValueError:
        await websocket.send_text(json.dumps({"error": "Invalid camera ID(s)"}))
        await websocket.close()
        return

    cameras = {}
    for camera_id in ids:
        capture = cv2.VideoCapture(camera_id)
        if capture.isOpened():
            cameras[camera_id] = capture
        else:
            await websocket.send_text(json.dumps({"error": "not_found", "camera_id": camera_id, "data": f"Camera {camera_id} is unavailable"}))

    if not cameras:
        await websocket.send_text(json.dumps({"error": "no_cameras", "data": "No cameras available"}))
        await websocket.close()
        return

    async def stream_camera(camera_id, capture):
        try:
            while True:
                is_frame_ok, frame = capture.read()
                if not is_frame_ok:
                    continue
                _, buffer = cv2.imencode('.jpg', frame)
                jpg_as_text = base64.b64encode(buffer).decode('utf-8')
                await websocket.send_text(json.dumps({
                    "type": "camera_frame",
                    "camera_id": camera_id,
                    "data": jpg_as_text
                }))
                await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            pass
        finally:
            capture.release()

    tasks = [asyncio.create_task(stream_camera(camera_id, capture)) for camera_id, capture in cameras.items()]

    try:
        await asyncio.gather(*tasks)
    except WebSocketDisconnect:
        print("Client disconnected from /ws/video")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        for task in tasks:
            task.cancel()
