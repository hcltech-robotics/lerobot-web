import asyncio
from typing import AsyncGenerator, List

import cv2


def open_camera(camera_id: int) -> cv2.VideoCapture:
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        raise RuntimeError(f"Camera {camera_id} cannot be opened")

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 15)

    return cap


def detect_cameras(max_devices: int = 10) -> List[int]:
    available: List[int] = []
    for i in range(max_devices):
        cap = cv2.VideoCapture(i)
        if cap is not None:
            ok, _ = cap.read()
            if ok:
                available.append(i)
        if cap is not None:
            cap.release()
    return available


async def generate_frames(camera_id: int) -> AsyncGenerator[bytes, None]:
    cap = open_camera(camera_id)

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
                await asyncio.sleep(0.005)
                continue

            ok, buf = await asyncio.to_thread(cv2.imencode, ".jpg", frame)
            if not ok:
                continue

            yield buf.tobytes()
    finally:
        cap.release()


class CameraStream:
    def __init__(self, camera_id: int) -> None:
        self.camera_id = camera_id
        self.cap = open_camera(camera_id)
        self.subscribers: set[asyncio.Queue[bytes]] = set()
        self.running = True
        self._task = asyncio.create_task(self._loop(), name=f"camera-stream-{camera_id}")

    async def _loop(self) -> None:
        try:
            while self.running:
                ret, frame = await asyncio.to_thread(self.cap.read)
                if not ret:
                    await asyncio.sleep(0.005)
                    continue

                ok, buf = await asyncio.to_thread(cv2.imencode, ".jpg", frame)
                if not ok:
                    continue

                data = buf.tobytes()

                for q in list(self.subscribers):
                    if not q.full():
                        q.put_nowait(data)
        finally:
            self.cap.release()

    async def subscribe(self) -> AsyncGenerator[bytes, None]:
        q: asyncio.Queue[bytes] = asyncio.Queue(maxsize=1)
        self.subscribers.add(q)
        try:
            while True:
                frame = await q.get()
                yield frame
        finally:
            self.subscribers.discard(q)

    def stop(self) -> None:
        self.running = False
