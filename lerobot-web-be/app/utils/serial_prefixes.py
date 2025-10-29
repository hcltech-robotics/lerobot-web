import sys

def get_serial_prefixes():
    if sys.platform.startswith("darwin"):
        return ["/dev/tty.usbmodem"]
    else:
        print("no darwin")
        return ["/dev/ttyACM", "/dev/ttyUSB"]
