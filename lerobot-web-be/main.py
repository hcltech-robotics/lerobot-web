from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
import signal
import time
import threading
from pydantic import BaseModel, Field, validator
from typing import Optional
import re

app = FastAPI(
    title="LeRobot Backend",
    summary="This is a backend service for web control of the LeRobot robotic arm",
    version="0.0.1",
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

process = None
output_lines = []
base_dir = "/home/jetson/lerobot"
control_robot_script_path = "lerobot/scripts/control_robot.py"
calibration_file_path = ".cache/calibration/so100/main_follower.json"
log_start_teleoperate_pattern = re.compile(
    r"^INFO \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}"
)

@app.on_event("startup")
def start_xvfb_if_needed():
    try:
        result = subprocess.run(["pgrep", "Xvfb"], stdout=subprocess.DEVNULL)
        if result.returncode != 0:
            print("[startup] Xvfb is not running, starting it...")
            subprocess.Popen(
                ["Xvfb", ":0", "-screen", "0", "1024x768x24"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        else:
            print("[startup] Xvfb is already running.")

        os.environ["DISPLAY"] = ":0"
        print("[startup] DISPLAY environment variable set: :0")

    except Exception as e:
        print("[startup] An error occurred while starting Xvfb: ", str(e))

def check_calibration_file_exits():
    calibration_script_path = os.path.join(base_dir, calibration_file_path)
    calibration_exists = os.path.exists(calibration_script_path)
    return calibration_exists

class StatusResponse(BaseModel):
    calibration: bool

@app.get("/status", response_model=StatusResponse, tags=["status"])
async def get_status():
    return StatusResponse(calibration=check_calibration_file_exits())

def read_teleoperate_stdout(proc):
    global output_lines
    for line in proc.stdout:
        decoded_line = line.strip()
        print("[robot log]:", decoded_line)
        output_lines.append(decoded_line)

class TeleoperateControlParams(BaseModel):
    mode: str = Field(..., pattern="^(start|stop|status)$")
    fps: Optional[int] = Field(30, ge=1, le=60)
    pid: Optional[int] = Field(0, ge=0)

class TeleoperateControlResponse(BaseModel):
    status: str
    pid: int
    message: str

@app.post("/teleoperate", response_model=TeleoperateControlResponse, tags=["control"])
async def control_teleoperate(params: TeleoperateControlParams):
    global process, output_lines

    try:
        if params.mode == "status":
            if process is not None and process.poll() is None:
                return {"status": "running", "pid": process.pid, "message": "Teleoperate is running"}
            return {"status": "not-running", "pid": 0, "message": "Teleoperate is not running"}

        elif params.mode == "stop":
            if process is None or process.poll() is not None:
                return {"status": "not-running", "pid": 0, "message": "No teleoperate has been started yet."}

            if params.pid != process.pid:
                raise HTTPException(status_code=400, detail=f"PID error: no process found with {params.pid}")

            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            process.wait()
            stopped_pid = process.pid
            process = None
            return {"status": "stopped", "pid": stopped_pid, "message": "Teleoperate has stopped"}

        elif params.mode == "start":
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
                f"--control.fps={params.fps}"
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

    except HTTPException:
        raise
    except Exception as e:
        return {"status": "error", "pid": 0, "message": str(e)}
