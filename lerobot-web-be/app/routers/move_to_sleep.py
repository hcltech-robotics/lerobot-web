from fastapi import APIRouter

from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig

router = APIRouter()


@router.get("/move_to_sleep")
def move_to_sleep():
    config = SO100FollowerConfig(port="/dev/tty.usbmodem58FA1019351", use_degrees=True)

    robot = SO100Follower(config)

    robot.connect(calibrate=False)

    middle_state = {
        "shoulder_pan.pos": -0.50,
        "shoulder_lift.pos": -119.8,
        "elbow_flex.pos": 70.0,
        "wrist_flex.pos": 50.0,
        "wrist_roll.pos": 0.2,
        "gripper.pos": 0.72,
    }

    robot.send_action(middle_state)

    robot.disconnect()
