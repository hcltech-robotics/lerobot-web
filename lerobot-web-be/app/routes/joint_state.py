from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..services.joint_state_manager import joint_state_manager

router = APIRouter()


@router.websocket("/ws/joint_state")
async def joint_state_ws(websocket: WebSocket, follower_id: str):
    await websocket.accept()

    try:
        while True:
            await joint_state_manager.wait_for_update()

            payload = joint_state_manager.get_latest(follower_id)
            if payload is None:
                continue

            await websocket.send_json(payload)

    except WebSocketDisconnect:
        return
