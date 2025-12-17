import sys


def get_serial_prefixes(robot_id: str = ""):
    if sys.platform.startswith("darwin"):
        return ["/dev/tty.usbmodem"]
    else:
        print("no darwin")
        if robot_id.startswith("lerobot_"):
            return ["/dev/"]
        return ["/dev/ttyACM", "/dev/ttyUSB"]
