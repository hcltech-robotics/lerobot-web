import re

from fastapi import APIRouter
from lerobot.find_port import find_available_ports

router = APIRouter()


# get the current connected robot arm serial numbers
@router.get("/robots", tags=["robots"])
def get_available_robots():
    usb_ports = find_available_ports()
    prefix = "/dev/tty.usbmodem"

    pattern = re.compile(rf"^{re.escape(prefix)}([\w\d]+)$")
    matching_ports = [dev for dev in usb_ports if pattern.fullmatch(dev)]
    ids = []
    for path in matching_ports:
        match = pattern.match(path)
        if match:
            ids.append(match.group(1))

    return ids
