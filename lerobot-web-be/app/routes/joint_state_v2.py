import asyncio
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig

from ..utils.joint_state import remap_joint_state_keys_for_client

router = APIRouter()


@router.websocket("/ws/joint_state")
async def websocket_joint_state(websocket: WebSocket):
    """
    WebSocket connection for one or more robot arm joint state.
    Client should send a similar JSON:
    {
        "followers": ["robot_id_1", "robot_id_2"]
    }
    """
    await websocket.accept()
    robots = {}

    try:
        init_data = await websocket.receive_json()
        follower_ids = init_data.get("followers", [])
        if not follower_ids:
            await websocket.send_json({"error": "No followers provided"})
            await websocket.close()
            return

        for fid in follower_ids:
            try:
                config = SO100FollowerConfig(
                    port=f"/dev/tty.usbmodem{fid}", use_degrees=True
                )
                robot = SO100Follower(config)
                print(f"Connecting to robot at port: {config.port}")
                robot.connect(calibrate=False)
                robots[fid] = robot
            except Exception as e:
                await websocket.send_json(
                    {"error": f"Failed to connect to robot {fid}: {e}"}
                )

        if not robots:
            await websocket.send_json({"error": "No robots connected"})
            await websocket.close()
            return

        async def get_robot_state(fid, robot):
            try:
                obs = await asyncio.to_thread(robot.get_observation)
                return fid, remap_joint_state_keys_for_client(obs)
            except Exception as e:
                return fid, {"error": str(e)}

        while True:
            start_time = time.perf_counter()

            results = await asyncio.gather(
                *(get_robot_state(fid, robot) for fid, robot in robots.items())
            )

            all_states = dict(results)

            await websocket.send_json({"timestamp": time.time(), "robots": all_states})

            elapsed = time.perf_counter() - start_time
            wait_time = max(0, (1 / 60) - elapsed)  # 60Hz
            await asyncio.sleep(wait_time)

    except WebSocketDisconnect:
        print("Client disconnected from ws/joint_state_multi")
    except Exception as e:
        print(f"Error in ws/joint_state_multi: {e}")
    finally:
        for r in robots.values():
            r.disconnect()
        print("All robots disconnected")
