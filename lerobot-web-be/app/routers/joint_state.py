from fastapi import APIRouter

from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig

router = APIRouter()


# get the current state once from robot arm and print the values
@router.get("/joint_state")
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
