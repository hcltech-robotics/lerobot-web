from pydantic import BaseModel


class JointState(BaseModel):
    rotation: float
    pitch: float
    elbow: float
    wristPitch: float
    wristRoll: float
    jaw: float


JOINT_NAME_MAP = {
    "shoulder_pan.pos": "rotation",
    "shoulder_lift.pos": "pitch",
    "elbow_flex.pos": "elbow",
    "wrist_flex.pos": "wristPitch",
    "wrist_roll.pos": "wristRoll",
    "gripper.pos": "jaw",
}
