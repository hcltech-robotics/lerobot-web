import logging
import os
import shlex

from fastapi import APIRouter, FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from huggingface_hub import HfApi

from ..models.ai_control import AIControlParams, AIControlResponse, UserModelsRequest, UserModelsResponse, GrootRequest, GrootResponse, GrootStatusResponse
from ..services.ai_control import ai_control_manager
from ..utils.process_manager import manager

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/ai-control/start", response_model=AIControlResponse, tags=["control"])
async def ai_control_start(params: AIControlParams):
    result = await ai_control_manager.start(params)
    return AIControlResponse(**result)


@router.post("/ai-control/stop", response_model=AIControlResponse, tags=["control"])
async def ai_control_stop():
    result = await ai_control_manager.stop()
    return AIControlResponse(**result)

@router.post("/user-models", response_model=UserModelsResponse, tags=["status"])
def list_user_models(req: UserModelsRequest):
    try:
        hf_api = HfApi(token=req.api_key)
        models_list = hf_api.list_models(author=req.user_id)
        models = [{"modelId": m.modelId, "id": m._id, "private": m.private, "createdAt": m.created_at} for m in models_list]
    except Exception as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    return {"models": models}

# leader: /dev/tty.usbmodem5A7A0157151
# follower: /dev/tty.usbmodem5AAF2703371
PYTHON_BIN = os.environ.get("PYTHON_BIN", "python")
SCRIPT_PATH = os.environ.get("EVAL_SCRIPT", "test.py")
WORKDIR = os.environ.get("EVAL_WORKDIR", os.getcwd())

ROBOT_TYPE = os.environ.get("ROBOT_TYPE", "so101_follower")
ROBOT_PORT = os.environ.get("ROBOT_PORT", "/dev/tty.usbmodem5AAF2703371")
ROBOT_ID = os.environ.get("ROBOT_ID", "hcltech_lerobot_follower_arm_right")
# ROBOT_PORT = os.environ.get("ROBOT_PORT", "/dev/lerobot_follower_arm_right")
# ROBOT_ID = os.environ.get("ROBOT_ID", "hcltech_lerobot_follower_arm_right")
POLICY_HOST = os.environ.get("POLICY_HOST", "192.168.227.195")
# POLICY_HOST = os.environ.get("POLICY_HOST", "127.0.0.1")
SHOW_IMAGES = os.environ.get("SHOW_IMAGES", "False")
ACTION_HORIZON = os.environ.get("ACTION_HORIZON", "16")
USE_SMOOTHING = os.environ.get("USE_SMOOTHING", "True")
SMOOTHING_ALPHA = os.environ.get("SMOOTHING_ALPHA", "0.1")
TIMEOUT_SEC = os.environ.get("TIMEOUT_SEC", "60")

ROBOT_CAMERAS = os.environ.get(
    "ROBOT_CAMERAS",
    "{front: {type: opencv, index_or_path: /dev/cam_overhead, width: 640, height: 480, fps: 30, fourcc: 'MJPG'}, "
    "wrist: {type: opencv, index_or_path: /dev/cam_wrist_right, width: 640, height: 480, fps: 30, fourcc: 'MJPG'}}",
)

CHILD_ENV = os.environ.copy()

@router.get("/ai-control/groot/status", response_model=GrootStatusResponse, tags=["groot"])
async def status():
    return GrootStatusResponse(running=manager.is_running(), pid=(manager.proc.pid if manager.is_running() else None))

@router.post("/ai-control/groot/start", response_model=GrootResponse, tags=["groot"])
async def start(req: GrootRequest):
    args = [
        PYTHON_BIN,
        SCRIPT_PATH,
        f"--robot.type={ROBOT_TYPE}",
        f"--robot.port={ROBOT_PORT}",
        f"--robot.id={ROBOT_ID}",
        f"--robot.cameras={ROBOT_CAMERAS}",
        f"--policy_host={POLICY_HOST}",
        f"--show_images={SHOW_IMAGES}",
        f"--action_horizon={ACTION_HORIZON}",
        f"--use_action_smoothing={USE_SMOOTHING}",
        f"--smoothing_alpha={SMOOTHING_ALPHA}",
        f"--timeout={TIMEOUT_SEC}",
        f"--lang_instruction={req.lang_instruction}",
    ]

    try:
        print('start process')
        pid = await manager.start(args, cwd=WORKDIR, env=CHILD_ENV)
        return GrootResponse(started=True, pid=pid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start groot: {e}")

@router.post("/ai-control/groot/stop", tags=["groot"])
async def stop():
    await manager.stop()
    return {"stopped": True}

@router.websocket("/ai-control/groot/stream")
async def stream(ws: WebSocket):
    await ws.accept()
    try:
        if not manager.is_running():
            await ws.send_text("[GROOT] not running")
            await ws.close()
            return
        async for line in manager.stream_lines():
            print('ws message: ', line)
            await ws.send_text(line)
        await ws.send_text("[GROOT] process finished")
    except WebSocketDisconnect:
        return
    finally:
        pass
