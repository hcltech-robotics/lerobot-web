import asyncio
import time

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from pydantic import BaseModel

router = APIRouter()


class JointState(BaseModel):
    rotation: float
    pitch: float
    elbow: float
    wristPitch: float
    wristRoll: float
    jaw: float


def remap_joint_state_keys_for_client(
    raw_joint_states: dict[str, float],
) -> dict[str, float]:
    JOINT_NAME_MAP = {
        "shoulder_pan.pos": "rotation",
        "shoulder_lift.pos": "pitch",
        "elbow_flex.pos": "elbow",
        "wrist_flex.pos": "wristPitch",
        "wrist_roll.pos": "wristRoll",
        "gripper.pos": "jaw",
    }

    return {
        frontend_key: raw_joint_states[backend_key]
        for backend_key, frontend_key in JOINT_NAME_MAP.items()
        if backend_key in raw_joint_states
    }


# get the current state once from robot arm and print the values
@router.get("/joint_state", response_model=JointState, tags=["status"])
def get_state(follower_id: str):
    config = SO100FollowerConfig(
        port=f"/dev/tty.usbmodem{follower_id}", use_degrees=True
    )
    robot = SO100Follower(config)

    try:
        print(f"Connecting to robot at port: {config.port}")

        robot.connect(calibrate=False)
    except IndexError as e:
        print(f"Failed to connect to motors: {e}")
        return {"error": "Motor connection failed. Check power and port."}

    obs = robot.get_observation()

    joint_states = remap_joint_state_keys_for_client(obs)

    print("Joint state:")
    for name, value in joint_states.items():
        print(f"  {name}: {value:.2f}")

    robot.disconnect()
    return joint_states


@router.websocket("/ws/joint_state")
async def websocket_joint_state(websocket: WebSocket, follower_id: str = Query(...)):
    await websocket.accept()

    config = SO100FollowerConfig(
        port=f"/dev/tty.usbmodem{follower_id}", use_degrees=True
    )
    robot = SO100Follower(config)

    try:
        print(f"Connecting to robot at port: {config.port}")
        robot.connect(calibrate=False)
    except Exception as e:
        print(f"Failed to connect to robot: {e}")
        await websocket.send_json({"error": "Failed to connect to robot"})
        await websocket.close()
        return

    try:
        while True:
            start_time = time.perf_counter()

            obs = robot.get_observation()
            joint_states = remap_joint_state_keys_for_client(obs)

            await websocket.send_json(
                {"timestamp": time.time(), "joint_states": joint_states}
            )

            elapsed = time.perf_counter() - start_time
            wait_time = max(0, (1 / 60) - elapsed)  # 60Hz update rate
            await asyncio.sleep(wait_time)

    except WebSocketDisconnect:
        print("Client disconnected from ws/joint_state")
    except Exception as e:
        print(f"Error in ws/joint_state: {e}")
    finally:
        robot.disconnect()
        print("Robot disconnected")
