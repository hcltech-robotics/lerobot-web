# LeRobot Backend

Created by Python based FastAPI web framework.

## Activating a virtual environment for the backend

If you haven't created your own yet, see [Python virtual environment setup](https://www.w3schools.com/python/python_virtualenv.asp).

```bash
python -m venv lerobot
```

Activation (e.g. on Linux and macOS):
```bash
source lerobot/bin/activate
```

## Install

Install dependencies:

```bash
pip install "fastapi[standard]" uvicorn starlette aiortc python-multipart opencv-python transformers pytest feetech-servo-sdk placo
```

## Clone the `lerobot` repository into the root directory:

```bash
git clone https://github.com/hcltech-robotics/lerobot.git
```

## Navigate into the `lerobot` folder and install the package:

```bash
cd lerobot
pip install -e .
```

## Verify the installation from the root directory:

```bash
python -c "import lerobot; print(lerobot.__file__)"
```

## (OPTIONAL) Create udev rules:

```bash
nano /etc/udev/rules.d/99-robots.rules
```

Use the following or similar text to create udev rule. It is IMPORTANT to start the SYMLINK and TAG with "lerobot_".

```bash
# Follower
SUBSYSTEM=="tty", KERNEL=="ttyACM*", \
  ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="55d3", ATTRS{serial}=="{{FOLLOWER_ROBOT_SERIAL}}", \
  SYMLINK+="lerobot_follower_1", TAG+="lerobot_follower", GROUP="dialout", MODE="0660"

# Leader
SUBSYSTEM=="tty", KERNEL=="ttyACM*", \
  ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="55d3", ATTRS{serial}=="{{LEADER_ROBOT_SERIAL}}", \
  SYMLINK+="lerobot_leader_1", TAG+="lerobot_leader", GROUP="dialout", MODE="0660"
```

Then trigger the rules with the following:
```bash
sudo udevadm control --reload-rules

sudo udevadm trigger
```


## Start the app:

Run the application itself:

```
uvicorn app.main:app --reload
```

Then, you can check it in the browser, just open: http://127.0.0.1:8000

## Interactive API docs:

There is an auto generated swagger ui for the available api point, just open: http://127.0.0.1:8000/docs#/
