import glob
import os
import re
import sys
from pathlib import Path

from fastapi import HTTPException
from lerobot.robots.bi_so100_follower.bi_so100_follower import BiSO100Follower
from lerobot.robots.bi_so100_follower.config_bi_so100_follower import (
    BiSO100FollowerConfig,
)
from lerobot.robots.so100_follower.config_so100_follower import SO100FollowerConfig
from lerobot.robots.so100_follower.so100_follower import SO100Follower
from lerobot.robots.so101_follower.config_so101_follower import SO101FollowerConfig
from lerobot.robots.so101_follower.so101_follower import SO101Follower
from lerobot.scripts.lerobot_find_port import find_available_ports
from lerobot.teleoperators.bi_so100_leader.bi_so100_leader import BiSO100Leader
from lerobot.teleoperators.bi_so100_leader.config_bi_so100_leader import (
    BiSO100LeaderConfig,
)
from lerobot.teleoperators.so100_leader.config_so100_leader import SO100LeaderConfig
from lerobot.teleoperators.so100_leader.so100_leader import SO100Leader
from lerobot.teleoperators.so101_leader.config_so101_leader import SO101LeaderConfig
from lerobot.teleoperators.so101_leader.so101_leader import SO101Leader

from ..bi_so101_support.bi_so101_follower import BiSO101Follower
from ..bi_so101_support.bi_so101_leader import BiSO101Leader
from ..bi_so101_support.config_bi_so101_follower import BiSO101FollowerConfig
from ..bi_so101_support.config_bi_so101_leader import BiSO101LeaderConfig
from ..models.robots import RobotType
from ..utils.serial_prefixes import get_serial_prefixes


# get the current connected robot arm serial numbers
async def find_serial_ids():
    usb_ports = [str(p) for p in find_available_ports()]
    prefixes = get_serial_prefixes()

    def is_candidate(dev: str) -> bool:
        return any(dev.startswith(pref) for pref in prefixes)

    tty_candidates = [p for p in usb_ports if is_candidate(p)]
    ids = []
    for dev in tty_candidates:
        robot_name = find_robot_udev_name(dev)
        if robot_name:
            ids.append(robot_name)
            continue
        if sys.platform.startswith("darwin"):
            for pref in prefixes:
                if dev.startswith(pref):
                    ids.append(dev[len(pref) :])
                    break
        else:
            name = Path(dev).name
            match = re.match(r"tty(ACM|USB)(\d+)", name)
            if match:
                ids.append(match.group(2))
            else:
                ids.append(name)
    return ids


def find_robot_udev_name(dev_path: str):
    """
    Find all /dev/lerobot_* symlink,
    give back all port that start with robot_... name.
    """
    dev_basename = Path(dev_path).name  # ttyUSB0
    for path in glob.glob("/dev/lerobot_*"):
        try:
            target = os.readlink(path)  # "ttyUSB0"
            if Path(target).name == dev_basename:
                return Path(path).name  # "robot_leader_1"
        except OSError:
            continue
    return None


def configure_follower(
    is_bi_setup: bool,
    follower_map: dict,
    robot_type: RobotType,
    camera_config: dict = {},
):
    prefixes = get_serial_prefixes(list(follower_map.values())[0])
    if robot_type == RobotType.SO100:
        if is_bi_setup:
            follower_config = BiSO100FollowerConfig(
                left_arm_port=f"{prefixes[0]}{follower_map['left']}",
                right_arm_port=f"{prefixes[0]}{follower_map['right']}",
                cameras=camera_config,
                # id="hcltech_lerobot_arm"
            )
            return BiSO100Follower(follower_config)
        else:
            follower_id = list(follower_map.values())[0]
            follower_config = SO100FollowerConfig(
                port=f"{prefixes[0]}{follower_id}",
                id="hcltech_lerobot_follower_arm_left",
            )
            return SO100Follower(follower_config)
    if robot_type == RobotType.SO101:
        if is_bi_setup:
            follower_config = BiSO101FollowerConfig(
                left_arm_port=f"{prefixes[0]}{follower_map['left']}",
                right_arm_port=f"{prefixes[0]}{follower_map['right']}",
                cameras=camera_config,
                # id="hcltech_lerobot_arm"
            )
            return BiSO101Follower(follower_config)

        else:
            follower_id = list(follower_map.values())[0]
            follower_config = SO101FollowerConfig(
                port=f"{prefixes[0]}{follower_id}",
                id="hcltech_lerobot_follower_arm_left",
            )
            return SO101Follower(follower_config)


def configure_leader(is_bi_setup: bool, leader_map: dict, robot_type: RobotType):
    prefixes = get_serial_prefixes(list(leader_map.values())[0])
    if robot_type == RobotType.SO100:
        if is_bi_setup:
            follower_config = BiSO100LeaderConfig(
                left_arm_port=f"{prefixes[0]}{leader_map['left']}",
                right_arm_port=f"{prefixes[0]}{leader_map['right']}",
                # id="hcltech_lerobot_arm"
            )
            return BiSO100Leader(follower_config)
        else:
            leader_id = list(leader_map.values())[0]
            leader_config = SO100LeaderConfig(
                port=f"{prefixes[0]}{leader_id}", id="hcltech_lerobot_leader_arm_left"
            )

            return SO100Leader(leader_config)
    if robot_type == RobotType.SO101:
        if is_bi_setup:
            leader_config = BiSO101LeaderConfig(
                left_arm_port=f"{prefixes[0]}{leader_map['left']}",
                right_arm_port=f"{prefixes[0]}{leader_map['right']}",
                # id="hcltech_lerobot_arm"
            )
            return BiSO101Leader(leader_config)

        else:
            leader_id = list(leader_map.values())[0]
            leader_config = SO101LeaderConfig(
                port=f"{prefixes[0]}{leader_id}", id="hcltech_lerobot_leader_arm_left"
            )
            return SO101Leader(leader_config)
