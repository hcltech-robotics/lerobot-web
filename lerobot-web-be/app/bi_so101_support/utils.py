from lerobot.robots import RobotConfig
from lerobot.robots.robot import Robot
from lerobot.teleoperators.config import TeleoperatorConfig
from lerobot.teleoperators.teleoperator import Teleoperator


def make_robot_from_config(config: RobotConfig) -> Robot:
    if config.type == "bi_so101_follower":
        from .bi_so101_follower import BiSO101Follower

        return BiSO101Follower(config)
    else:
        raise ValueError(config.type)


def make_teleoperator_from_config(config: TeleoperatorConfig) -> Teleoperator:
    if config.type == "bi_so101_leader":
        from .bi_so101_leader import BiSO101Leader

        return BiSO101Leader(config)
    else:
        raise ValueError(config.type)
