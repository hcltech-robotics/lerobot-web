from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig
from lerobot.teleoperators.so100_leader import SO100Leader, SO100LeaderConfig

router = APIRouter()


class RobotKind(str, Enum):
    follower = "follower"
    leader = "leader"


class CalibrationParams(BaseModel):
    robot_kind: RobotKind
    robot_to_calibrate_port: str


@router.post("/calibrate")
def calibrate(params: CalibrationParams):
    robot_kind = params.robot_kind
    port = params.robot_to_calibrate_port

    if robot_kind == RobotKind.follower:
        config = SO100FollowerConfig(port=port)
        robot = SO100Follower(config)
    elif robot_kind == RobotKind.leader:
        config = SO100LeaderConfig(port=port)
        robot = SO100Leader(config)
    else:
        raise HTTPException(
            status_code=400, detail="robot_kind must be 'follower' or 'leader'"
        )

    try:
        robot.connect(calibrate=False)
        robot.calibrate()
        robot.disconnect()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calibration failed: {e}")

    return {"status": "calibration successful"}
