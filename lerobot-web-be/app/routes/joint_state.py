from fastapi import APIRouter, Query, WebSocket
from pydantic import BaseModel

from ..services.teleoperate import teleop_manager

router = APIRouter()


class JointStateRequest(BaseModel):
    follower_id: str


@router.websocket("/ws/joint_state")
async def websocket_joint_state(websocket: WebSocket, follower_id: str = Query(...)):
    await websocket.accept()
    await teleop_manager.stream_joint_states(websocket, follower_id)
