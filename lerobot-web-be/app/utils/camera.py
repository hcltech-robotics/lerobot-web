import platform

IS_MAC = platform.system() == "Darwin"
IS_LINUX = platform.system() == "Linux"

import asyncio
import base64

import cv2

if IS_LINUX:
    import gi

    gi.require_version("Gst", "1.0")
    from gi.repository import Gst, GObject
    import asyncio
    from typing import Dict, List, Optional

    Gst.init(None)
    # Global public_id -> source mapping
    # each entry: { "provider": "pipewire"|"v4l2"|"avfoundation"|"opencv", "device": "/dev/videoN" or node_id or index, "name": str }
    _camera_map: Dict[int, Dict] = {}
    _next_public_id = 0

    # per-camera asyncio locks
    _camera_locks: Dict[int, asyncio.Lock] = {}

    def _alloc_public_id() -> int:
        global _next_public_id
        pid = _next_public_id
        _next_public_id += 1
        return pid

    def _get_camera_lock(public_id: int) -> asyncio.Lock:
        if public_id not in _camera_locks:
            _camera_locks[public_id] = asyncio.Lock()
        return _camera_locks[public_id]

    def detect_cameras():
        """
        Scan system for cameras. Returns list of public IDs.
        Populates/refreshes _camera_map.
        """
        global _camera_map, _next_public_id
        _camera_map = {}
        _next_public_id = 0

        monitor = Gst.DeviceMonitor()
        monitor.add_filter("Video/Source", None)
        monitor.start()
        devices = monitor.get_devices()
        for dev in devices:
            props = dev.get_properties()
            if not props:
                continue
            path = props.get_string("object.path")
            node_desc = props.get_string("node.description") or dev.get_display_name()
            if path and path.startswith("v4l2:/dev/video"):
                devpath = path.replace("v4l2:", "")
                pid = _alloc_public_id()
                _camera_map[pid] = {
                    "provider": "v4l2",
                    "device": devpath,
                    "name": node_desc,
                }
            else:
                raw = props.get_string("object.id") or None
                if raw:
                    try:
                        node_id = int(raw)
                        pid = _alloc_public_id()
                        _camera_map[pid] = {
                            "provider": "pipewire",
                            "node_id": node_id,
                            "name": node_desc,
                        }
                    except Exception:
                        pass
        monitor.stop()
        if _camera_map:
            return sorted(_camera_map.keys())
        return []

    def camera_info(public_id: int) -> Optional[Dict]:
        return _camera_map.get(public_id)

    async def generate_frames(public_id: int):
        """
        Yields JPEG bytes for the given public_id.
        Uses GStreamer if available and mapping indicates pipewire/v4l2/avfoundation.
        Falls back to OpenCV capture + JPEG encoding.
        """
        info = camera_info(public_id)
        if not info:
            raise RuntimeError(f"Unknown camera id {public_id}")
        provider = info["provider"]
        lock = _get_camera_lock(public_id)
        async with lock:
            if provider in ("pipewire", "v4l2", "avfoundation"):
                loop = asyncio.get_event_loop()
                if provider == "pipewire":
                    node = info["node_id"]
                    pipeline_str = (
                        f"pipewiresrc path={node} ! "
                        "image/jpeg,framerate=30/1 ! jpegparse ! "
                        "videoconvert ! jpegenc ! appsink name=sink emit-signals=true max-buffers=1 drop=true"
                    )
                elif provider == "v4l2":
                    dev = info["device"]
                    pipeline_str = (
                        f"v4l2src device={dev} ! "
                        "videoconvert ! videorate ! videoscale ! video/x-raw,format=I420,width=640,height=480,framerate=30/1 ! "
                        "jpegenc quality=80 ! appsink name=sink emit-signals=true max-buffers=1 drop=true"
                    )
                else:
                    dev = info.get("device")
                    pipeline_str = (
                        f"avfvideosrc device-index=0 ! videoconvert ! "
                        "jpegenc quality=80 ! appsink name=sink emit-signals=true max-buffers=1 drop=true"
                    )
                pipeline = Gst.parse_launch(pipeline_str)
                appsink = pipeline.get_by_name("sink")
                if appsink is None:
                    pipeline.set_state(Gst.State.NULL)
                    raise RuntimeError("Gst appsink not found")
                pipeline.set_state(Gst.State.PLAYING)
                try:
                    while True:
                        sample = await loop.run_in_executor(
                            None, appsink.emit, "pull-sample"
                        )
                        if not sample:
                            await asyncio.sleep(0.01)
                            continue
                        buf = sample.get_buffer()
                        ok, map_info = buf.map(Gst.MapFlags.READ)
                        if not ok:
                            continue
                        data = bytes(map_info.data)
                        buf.unmap(map_info)
                        yield data

                        break
                    while True:
                        sample = await loop.run_in_executor(
                            None, appsink.emit, "pull-sample"
                        )
                        if not sample:
                            await asyncio.sleep(0.01)
                            continue
                        buf = sample.get_buffer()
                        ok, map_info = buf.map(Gst.MapFlags.READ)
                        if not ok:
                            continue
                        data = bytes(map_info.data)
                        buf.unmap(map_info)
                        yield data
                finally:
                    pipeline.set_state(Gst.State.NULL)
            else:
                raise RuntimeError("No available backend (GStreamer)")

elif IS_MAC:

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
