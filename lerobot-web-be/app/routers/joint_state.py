import asyncio
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig

router = APIRouter()


# get the current state once from robot arm and print the values
@router.get("/joint_state", tags=["status"])
def get_state():
    # get port: python -m lerobot.find_port
    config = SO100FollowerConfig(port="/dev/tty.usbmodem58FA1019351", use_degrees=True)
    robot = SO100Follower(config)

    robot.connect(calibrate=False)

    obs = robot.get_observation()

    joint_states = {k: v for k, v in obs.items() if k.endswith(".pos")}
    print("Joint state:")
    for name, value in joint_states.items():
        print(f"  {name}: {value:.2f}")

    robot.disconnect()

@router.websocket("/ws/joint_state")
async def websocket_joint_state(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            start_time = time.perf_counter()

            data = {"timestamp": time.time()}

            await websocket.send_json(data)

            elapsed = time.perf_counter() - start_time
            wait_time = max(0, (1 / 60) - elapsed)
            await asyncio.sleep(wait_time)

    except WebSocketDisconnect:
        print("Client disconnected from ws/joint_state")
    except Exception as e:
        print(f"Error in ws/joint_state: {e}")
