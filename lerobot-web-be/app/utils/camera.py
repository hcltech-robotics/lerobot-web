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

    for _ in range(10):
        ret, frame = await asyncio.to_thread(cap.read)
        if ret:
            break
        await asyncio.sleep(0.05)
    else:
        cap.release()
        raise RuntimeError(f"Camera {camera_id} did not deliver frames")

    try:
        while True:
            ret, frame = await asyncio.to_thread(cap.read)
            if not ret:
                await asyncio.sleep(0.02)
                continue
            ok, buf = await asyncio.to_thread(cv2.imencode, ".jpg", frame)
            if not ok:
                continue
            yield buf.tobytes()
            await asyncio.sleep(0.03)
    finally:
        cap.release()
