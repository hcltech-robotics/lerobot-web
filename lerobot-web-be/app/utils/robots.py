import re

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

from ..models.robots import RobotType
from ..utils.serial_prefixes import get_serial_prefixes


# get the current connected robot arm serial numbers
async def find_serial_ids():
    usb_ports = find_available_ports()
    prefixes = get_serial_prefixes()

    pattern = re.compile(rf"^{re.escape(prefixes[0])}([\w\d]+)$")
    matching_ports = [dev for dev in usb_ports if pattern.fullmatch(dev)]
    ids = []
    for path in matching_ports:
        match = pattern.match(path)
        if match:
            ids.append(match.group(1))

    return ids


def configure_follower(
    is_bi_setup: bool,
    follower_map: dict,
    robot_type: RobotType,
    camera_config: dict = {},
):
    prefixes = get_serial_prefixes()
    if robot_type == RobotType.SO100:
        if is_bi_setup:
            follower_config = BiSO100FollowerConfig(
                left_arm_port=f"{prefixes[0]}{follower_map['left']}",
                right_arm_port=f"{prefixes[0]}{follower_map['right']}",
                cameras=camera_config,
            )
            return BiSO100Follower(follower_config)
        else:
            follower_id = list(follower_map.values())[0]
            follower_config = SO100FollowerConfig(port=f"{prefixes[0]}{follower_id}")
            return SO100Follower(follower_config)
    if robot_type == RobotType.SO101:
        if is_bi_setup:
            raise HTTPException(
                status_code=500, detail=f"No dual arm setup implemented for SO-101"
            )

            # follower_config = BiSO101LeaderConfig(
            #    left_arm_port=f"{prefixes[0]}{leader_map['left']}",
            #    right_arm_port=f"{prefixes[0]}{leader_map['right']}",
            # )
            # return BiSO101Leader(follower_config)
        else:
            follower_id = list(follower_map.values())[0]
            follower_config = SO101FollowerConfig(port=f"{prefixes[0]}{follower_id}")
            return SO101Follower(follower_config)


def configure_leader(is_bi_setup: bool, leader_map: dict, robot_type: RobotType):
    prefixes = get_serial_prefixes()
    if robot_type == RobotType.SO100:
        if is_bi_setup:
            follower_config = BiSO100LeaderConfig(
                left_arm_port=f"{prefixes[0]}{leader_map['left']}",
                right_arm_port=f"{prefixes[0]}{leader_map['right']}",
            )
            return BiSO100Leader(follower_config)
        else:
            leader_id = list(leader_map.values())[0]
            leader_config = SO100LeaderConfig(port=f"{prefixes[0]}{leader_id}")

            return SO100Leader(leader_config)
    if robot_type == RobotType.SO101:
        if is_bi_setup:
            raise HTTPException(
                status_code=500, detail=f"No dual arm setup implemented for SO-101"
            )

            # follower_config = BiSO101LeaderConfig(
            #    left_arm_port=f"{prefixes[0]}{leader_map['left']}",
            #    right_arm_port=f"{prefixes[0]}{leader_map['right']}",
            # )
            # return BiSO101Leader(follower_config)
        else:
            leader_id = list(leader_map.values())[0]
            leader_config = SO101LeaderConfig(port=f"{prefixes[0]}{leader_id}")
            return SO101Leader(leader_config)
