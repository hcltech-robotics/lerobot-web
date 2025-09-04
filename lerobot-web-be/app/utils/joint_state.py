import math

from ..models.joint_state import JOINT_NAME_MAP


def remap_keys_for_client_and_convert_to_deg(
    raw_joint_states: dict[str, float],
) -> dict[str, float]:

    return {
        frontend_key: math.radians(raw_joint_states[backend_key])
        for backend_key, frontend_key in JOINT_NAME_MAP.items()
        if backend_key in raw_joint_states
    }
