import asyncio
import base64

import cv2


def detect_cameras(max_devices=10):
    available = []
    for i in range(max_devices):
        cap = cv2.VideoCapture(i)
        if cap is not None and cap.read()[0]:
            available.append(i)
        cap.release()
    return available


async def generate_frames(camera_id: int):
    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        raise RuntimeError(f"Camera {camera_id} cannot be opened")

    try:
        while True:
            ret, frame = await asyncio.to_thread(cap.read)
            if not ret:
                continue
            _, buffer = await asyncio.to_thread(cv2.imencode, ".jpg", frame)
            frame_data = base64.b64encode(buffer).decode("utf-8")
            yield frame_data
            await asyncio.sleep(0.03)  # ~30 FPS
    finally:
        cap.release()
