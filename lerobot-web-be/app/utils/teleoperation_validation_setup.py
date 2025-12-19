from typing import List, Tuple

from fastapi import HTTPException

from ..models.teleoperate import RobotAssignment


def validate_teleop_setup(
    robots: List[RobotAssignment],
) -> Tuple[bool, dict, dict]:
    """
    Validates the teleoperation robot configuration and builds leader/follower maps.

    Returns:
        is_bi_setup: bool
        leader_map: dict
        follower_map: dict

    Raises:
        HTTPException with 400 status code if validation fails.
    """

    robot_count = len(robots)
    if robot_count not in (2, 4):
        raise HTTPException(
            status_code=400,
            detail="Expected 2 (single) or 4 (bimanual) robot assignments.",
        )

    role_counts = {"leader": 0, "follower": 0}
    for r in robots:
        role_counts[r.role.value] += 1

    if robot_count == 2 and (
        role_counts["leader"] != 1 or role_counts["follower"] != 1
    ):
        raise HTTPException(
            status_code=400,
            detail="Single-arm setup must have 1 leader and 1 follower.",
        )

    if robot_count == 4 and (
        role_counts["leader"] != 2 or role_counts["follower"] != 2
    ):
        raise HTTPException(
            status_code=400,
            detail="Bi-manual setup must have 2 leaders and 2 followers.",
        )

    leader_map = {}
    follower_map = {}

    for r in robots:
        if r.role.value == "leader":
            leader_map[r.side] = r.id
        elif r.role.value == "follower":
            follower_map[r.side] = r.id

    is_bi_setup = len(leader_map) == 2

    return is_bi_setup, leader_map, follower_map
