import math

from ..models.joint_state import JOINT_NAME_MAP


def remap_keys_for_client_and_convert_to_deg(
    raw_joint_states: dict[str, float],
) -> dict[str, float]:
    mapped = {}
    for backend_key, frontend_key in JOINT_NAME_MAP.items():
        if backend_key in raw_joint_states:
            val = raw_joint_states[backend_key]
            if backend_key == "wrist_roll.pos" or backend_key == "shoulder_pan.pos":
                val = -val
            mapped[frontend_key] = math.radians(val)
    return mapped


def remap_keys_for_backend_and_convert_to_rad(
    frontend_joint_states: dict[str, float],
) -> dict[str, float]:
    mapped = {}
    for backend_key, frontend_key in JOINT_NAME_MAP.items():
        if frontend_key in frontend_joint_states:
            val = frontend_joint_states[frontend_key]
            if frontend_key == "wristRoll" or frontend_key == "rotation":
                val = -val
            mapped[backend_key] = math.degrees(val)
    return mapped
