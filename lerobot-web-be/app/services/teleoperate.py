import logging
import threading
import time

from lerobot.robots.bi_so100_follower import BiSO100Follower, BiSO100FollowerConfig
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from lerobot.teleoperators.bi_so100_leader import BiSO100Leader, BiSO100LeaderConfig
from lerobot.teleoperators.so100_leader import SO100Leader, SO100LeaderConfig
from lerobot.utils.robot_utils import busy_wait

logger = logging.getLogger(__name__)

teleop_thread = None
stop_flag = threading.Event()


def teleoperate_worker(
    fps: int, leader_map: dict, follower_map: dict, is_bi_setup: bool
):
    leader_arm = None
    follower_arm = None

    try:
        if is_bi_setup:
            # Expect dict with 'left' and 'right' keys
            leader_config = BiSO100LeaderConfig(
                left_arm_port=f"/dev/tty.usbmodem{leader_map['left']}",
                right_arm_port=f"/dev/tty.usbmodem{leader_map['right']}",
            )
            follower_config = BiSO100FollowerConfig(
                left_arm_port=f"/dev/tty.usbmodem{follower_map['left']}",
                right_arm_port=f"/dev/tty.usbmodem{follower_map['right']}",
            )
            leader_arm = BiSO100Leader(leader_config)
            follower_arm = BiSO100Follower(follower_config)
        else:
            leader_id = list(leader_map.values())[0]
            follower_id = list(follower_map.values())[0]
            leader_config = SO100LeaderConfig(port=f"/dev/tty.usbmodem{leader_id}")
            follower_config = SO100FollowerConfig(
                port=f"/dev/tty.usbmodem{follower_id}"
            )
            leader_arm = SO100Leader(leader_config)
            follower_arm = SO100Follower(follower_config)

        leader_arm.connect(calibrate=False)
        follower_arm.connect(calibrate=False)

        if not leader_arm.is_connected or not follower_arm.is_connected:
            raise RuntimeError("Leader or follower arm failed to connect.")

        logger.info("Teleoperation started...")

        while not stop_flag.is_set():
            t0 = time.perf_counter()

            action = leader_arm.get_action()
            follower_arm.send_action(action)

            busy_wait(max(1.0 / fps - (time.perf_counter() - t0), 0.0))

        logger.info("Teleoperation stopped by user.")

    except Exception as e:
        logger.error(f"Teleoperation failed: {e}")

    finally:
        if leader_arm and leader_arm.is_connected:
            leader_arm.disconnect()
        if follower_arm and follower_arm.is_connected:
            follower_arm.disconnect()
        logger.info("Teleoperation thread cleanup done.")
