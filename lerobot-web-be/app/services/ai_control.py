import logging
import threading
import time

from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig

from ..utils.ai_control import download_and_load_policy

logger = logging.getLogger(__name__)

policy_thread = None
stop_flag = threading.Event()


def policy_worker(model_name: str, robot_id: str, fps: int):
    robot = None
    try:
        logger.info(f"Downloading and loading policy: {model_name}")
        policy = download_and_load_policy(model_name)

        config = SO100FollowerConfig(
            port=f"/dev/tty.usbmodem{robot_id}", use_degrees=True
        )
        robot = SO100Follower(config)
        robot.connect(calibrate=False)

        if not robot.is_connected:
            raise RuntimeError("Robot connection failed")

        logger.info("Policy playback started")

        obs = robot.get_observation()
        while not stop_flag.is_set():
            action = policy(obs)
            robot.send_action(action)
            time.sleep(1.0 / fps)

        logger.info("Policy playback stopped")

    except Exception as e:
        logger.error(f"Policy worker error: {e}")
    finally:
        if robot and robot.is_connected:
            robot.disconnect()
        logger.info("Policy worker cleanup done")
