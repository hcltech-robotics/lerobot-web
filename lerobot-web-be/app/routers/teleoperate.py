import logging
import time

from fastapi import APIRouter

from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from lerobot.teleoperators.so100_leader import SO100Leader, SO100LeaderConfig
from lerobot.utils.robot_utils import busy_wait

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/teleoperate")
def teleoperate():
    # get port: python -m lerobot.find_port
    leader_config = SO100LeaderConfig(
        port="/dev/tty.usbmodem5A4B0491371"
    )  # you can add id param as well if you set it during calibration
    follower_config = SO100FollowerConfig(
        port="/dev/tty.usbmodem58FA1019351"
    )  # you can add id param as well if you set it during calibration

    leader_arm = SO100Leader(leader_config)
    follower_arm = SO100Follower(follower_config)

    try:
        leader_arm.connect(calibrate=False)
        follower_arm.connect(calibrate=False)

        if not leader_arm.is_connected or not follower_arm.is_connected:
            raise RuntimeError("Leader or follower arm failed to connect.")

        logger.info("Teleoperation started...")

        FPS = 30
        DURATION_SEC = 120  # Run for 120 seconds for now
        end_time = time.time() + DURATION_SEC

        while time.time() < end_time:
            t0 = time.perf_counter()

            action = leader_arm.get_action()
            follower_arm.send_action(action)

            busy_wait(max(1.0 / FPS - (time.perf_counter() - t0), 0.0))

        logger.info("Teleoperation ended normally.")

        return {"status": "Teleoperation completed"}

    except Exception as e:
        logger.error(f"Teleoperation failed: {e}")
        raise

    finally:
        if leader_arm.is_connected:
            leader_arm.disconnect()
        if follower_arm.is_connected:
            follower_arm.disconnect()
