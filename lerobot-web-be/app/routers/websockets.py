from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import json
import asyncio
import base64
import cv2
from ..utilities import get_robot_joint_state

router = APIRouter()

MAX_CAMERA_IDS_NUMBER = 3

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
        raw_ids = [id_str.strip() for id_str in camera_ids.split(",")]

        if any(id_str == "" for id_str in raw_ids):
            raise ValueError("Camera ID list contains empty values or malformed input (e.g., double commas or spaces)")

        if len(raw_ids) > 3:
            raise ValueError("Maximum 3 camera IDs allowed")

        ids = []
        for id_str in raw_ids:
            camera_id = int(id_str)
            if camera_id < 0:
                raise ValueError("Camera IDs must be non-negative integers")
            ids.append(camera_id)

        if len(set(ids)) != len(ids):
            raise ValueError("Duplicate camera IDs are not allowed")

    except ValueError as e:
        await websocket.send_text(json.dumps({
            "error": "invalid_camera_ids",
            "data": str(e)
        }))
        await websocket.close()
        return

    cameras = {}

    for camera_id in ids:
        capture = cv2.VideoCapture(camera_id)
        if capture.isOpened():
            cameras[camera_id] = capture
        else:
            capture.release()
            await websocket.send_text(json.dumps({
                "error": "not_found",
                "camera_id": camera_id,
                "data": f"Camera {camera_id} is unavailable"
            }))

    if not cameras:
        await websocket.send_text(json.dumps({
            "error": "no_cameras",
            "data": "No cameras available"
        }))
        await websocket.close()
        return

    send_lock = asyncio.Lock()

    async def stream_camera(camera_id, capture):
        try:
            while True:
                is_frame_ok, frame = capture.read()
                if not is_frame_ok:
                    continue
                _, buffer = cv2.imencode('.jpg', frame)
                jpg_as_text = base64.b64encode(buffer).decode('utf-8')
                async with send_lock:
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

    tasks = [
        asyncio.create_task(stream_camera(camera_id, capture))
        for camera_id, capture in cameras.items()
    ]

    try:
        await asyncio.gather(*tasks)
    except WebSocketDisconnect:
        print("Client disconnected from /ws/video")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        for task in tasks:
            task.cancel()