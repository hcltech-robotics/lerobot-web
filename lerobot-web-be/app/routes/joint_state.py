import asyncio
import time

from fastapi import APIRouter, Query, WebSocket
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from pydantic import BaseModel

from ..models.joint_state import JointState
from ..services.teleoperate import teleop_manager
from ..utils.joint_state import remap_keys_for_client_and_convert_to_deg
from ..utils.serial_prefixes import get_serial_prefixes

router = APIRouter()


class JointStateRequest(BaseModel):
    follower_id: str


# get the current state once from robot arm and print the values
@router.post("/joint_state", response_model=JointState, tags=["status"])
def get_state(req: JointStateRequest):
    prefixes = get_serial_prefixes()
    config = SO100FollowerConfig(
        port=f"{prefixes[0]}{req.follower_id}", use_degrees=True
    )
    robot = SO100Follower(config)

    try:
        print(f"Connecting to robot at port: {config.port}")

        robot.connect(calibrate=False)
    except IndexError as e:
        print(f"Failed to connect to motors: {e}")
        return {"error": "Motor connection failed. Check power and port."}

    obs = robot.get_observation()

    joint_states = remap_keys_for_client_and_convert_to_deg(obs)

    print("Joint state:")
    for name, value in joint_states.items():
        print(f"  {name}: {value:.2f}")

    return joint_states


@router.websocket("/ws/joint_state")
async def websocket_joint_state(websocket: WebSocket, follower_id: str = Query(...)):
    await websocket.accept()
    await teleop_manager.stream_joint_states(websocket)
