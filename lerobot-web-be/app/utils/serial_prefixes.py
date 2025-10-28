import sys

def get_serial_prefixes():
    """Platformfüggő prefixek (regex nélkül)."""
    if sys.platform.startswith("darwin"):
        print("darwin")
        return ["/dev/tty.usbmodem"]
    else:
        print("no darwin")
        return ["/dev/ttyACM", "/dev/ttyUSB"]
