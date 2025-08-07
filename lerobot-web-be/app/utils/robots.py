import re

from lerobot.find_port import find_available_ports


# get the current connected robot arm serial numbers
def find_serial_ids():
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
