import re

from lerobot.scripts.lerobot_find_port import find_available_ports

from ..utils.serial_prefixes import get_serial_prefixes


# get the current connected robot arm serial numbers
def find_serial_ids():
    usb_ports = find_available_ports()
    prefixes = get_serial_prefixes()

    pattern = re.compile(rf"^{re.escape(prefixes[0])}([\w\d]+)$")
    matching_ports = [dev for dev in usb_ports if pattern.fullmatch(dev)]
    ids = []
    for path in matching_ports:
        match = pattern.match(path)
        if match:
            ids.append(match.group(1))

    return ids
