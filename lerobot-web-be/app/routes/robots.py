from fastapi import APIRouter

from ..utils.robots import find_serial_ids

router = APIRouter()


@router.get("/robots", tags=["robots"])
def get_available_robots():
    return find_serial_ids()
