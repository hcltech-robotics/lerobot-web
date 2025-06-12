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
        ids = [int(cid) for cid in camera_ids.split(",")]
    except ValueError:
        await websocket.send_text(json.dumps({"error": "Invalid camera ID(s)"}))
        await websocket.close()
        return

    cameras = {}
    for cid in ids:
        cap = cv2.VideoCapture(cid)
        if cap.isOpened():
            cameras[cid] = cap
        else:
            await websocket.send_text(json.dumps({"error": "not_found", "camera_id": cid, "data": f"Camera {cid} is unavailable"}))

    if not cameras:
        await websocket.send_text(json.dumps({"error": "no_cameras", "data": "No cameras available"}))
        await websocket.close()
        return

    async def stream_camera(cid, cap):
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    continue
                _, buffer = cv2.imencode('.jpg', frame)
                jpg_as_text = base64.b64encode(buffer).decode('utf-8')
                await websocket.send_text(json.dumps({
                    "type": "camera_frame",
                    "camera_id": cid,
                    "data": jpg_as_text
                }))
                await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            pass
        finally:
            cap.release()

    tasks = [asyncio.create_task(stream_camera(cid, cap)) for cid, cap in cameras.items()]

    try:
        await asyncio.gather(*tasks)
    except WebSocketDisconnect:
        print("Client disconnected from /ws/video")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        for task in tasks:
            task.cancel()
