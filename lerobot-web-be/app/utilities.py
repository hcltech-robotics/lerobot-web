import os
import signal
import subprocess
import threading
import time
import re
import random

process = None
output_lines = []
base_dir = "/home/jetson/lerobot"
control_robot_script_path = "lerobot/scripts/control_robot.py"
calibration_file_path = ".cache/calibration/so100/main_follower.json"

log_start_teleoperate_pattern = re.compile(
    r"^INFO \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}"
)

def get_robot_joint_state():
    return {
        "rotation": random.uniform(-1.6, 1.6),
        "pitch": random.uniform(-1.6, 1.6),
        "elbow": random.uniform(-1.6, 1.6),
        "wristPitch": random.uniform(-1.6, 1.6),
        "wristRoll": random.uniform(-1.6, 1.6),
        "jaw": random.uniform(-1.6, 1.6),
    }

def check_calibration_file_exists():
    calibration_script_path = os.path.join(base_dir, calibration_file_path)
    return os.path.exists(calibration_script_path)

def read_teleoperate_stdout(proc):
    global output_lines
    for line in proc.stdout:
        decoded_line = line.strip()
        print("[robot log]:", decoded_line)
        output_lines.append(decoded_line)

def start_teleoperate_process(fps: int = 30):
    global process, output_lines
    
    if process is not None and process.poll() is None:
        return {"status": "already running", "pid": process.pid, "message": "Teleoperate is already running"}
    
    calibration_script_path = os.path.join(base_dir, calibration_file_path)
    if not os.path.exists(calibration_script_path):
        return {
            "status": "error",
            "pid": 0,
            "message": "No calibration file found, a new calibration is required."
        }
    
    output_lines = []
    script_path = os.path.join(base_dir, control_robot_script_path)
    env = os.environ.copy()
    command = [
        "python",
        script_path,
        "--robot.type=so100",
        "--control.type=teleoperate",
        "--control.display_data=false",
        f"--control.fps={fps}"
    ]
    
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        env=env,
        cwd=base_dir,
        preexec_fn=os.setsid,
        bufsize=1,
        text=True
    )
    
    t = threading.Thread(target=read_teleoperate_stdout, args=(process,))
    t.daemon = True
    t.start()
    
    timeout = 10
    waited = 0
    while waited < timeout:
        if output_lines:
            first_line = output_lines[0]
            if log_start_teleoperate_pattern.match(first_line):
                return {
                    "status": "started",
                    "pid": process.pid,
                    "message": first_line
                }
            else:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                process.wait()
                process = None
                return {
                    "status": "error",
                    "pid": 0,
                    "message": f"Robot startup failed. First log line: {first_line}"
                }
        time.sleep(0.2)
        waited += 0.2
    
    return {
        "status": "started",
        "pid": process.pid,
        "message": "no output yet"
    }

def stop_teleoperate_process(pid: int):
    global process
    
    if process is None or process.poll() is not None:
        return {"status": "not-running", "pid": 0, "message": "No teleoperate has been started yet."}
    
    if pid != process.pid:
        return {"status": "error", "pid": 0, "message": f"PID error: no process found with {pid}"}
    
    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
    process.wait()
    stopped_pid = process.pid
    process = None
    return {"status": "stopped", "pid": stopped_pid, "message": "Teleoperate has stopped"}

def get_teleoperate_status():
    global process
    if process is not None and process.poll() is None:
        return {"status": "running", "pid": process.pid, "message": "Teleoperate is running"}
    return {"status": "not-running", "pid": 0, "message": "Teleoperate is not running"}
