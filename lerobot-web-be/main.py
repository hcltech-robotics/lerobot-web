from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
import signal
import time
import threading
from pydantic import BaseModel, Field, validator
from typing import Optional

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

def read_teleoperate_stdout(proc):
    global output_lines
    while True:
        line = proc.stdout.readline()
        if not line:
            break
        decoded_line = line.decode("utf-8").strip()
        print("[robot log]:", decoded_line)
        output_lines.append(decoded_line)

class TeleoperateParams(BaseModel):
    fps: Optional[int] = Field(30, ge=1, le=60)

class StartTeleoperateResponse(BaseModel):
    status: str
    pid: int
    message: str

@app.post("/start-teleoperate", response_model=StartTeleoperateResponse, tags=["control"])
async def start_teleoperate(params: TeleoperateParams):
    global process, output_lines

    try:
        if process is not None and process.poll() is None:
            return {"status": "already running", "pid": process.pid}

        output_lines = []
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../lerobot"))
        control_robot_script_path = "lerobot/scripts/control_robot.py"
        script_path = os.path.join(base_dir, control_robot_script_path)
        env = os.environ.copy()
        env["DISPLAY"] = ":0"

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
            bufsize=1
        )

        t = threading.Thread(target=read_teleoperate_stdout, args=(process,))
        t.daemon = True
        t.start()

        timeout = 10
        waited = 0
        while waited < timeout:
            if output_lines:
                return {"status": "started", "pid": process.pid, "message": output_lines[0]}
            time.sleep(0.2)
            waited += 0.2

        return {"status": "started", "pid": process.pid, "message": "no output yet"}

    except Exception as e:
        return {"status": "error", "pid": 0, "message": str(e)}


class StopTeleoperateParams(BaseModel):
    pid: int = Field(..., ge=0)

    @validator("pid")
    def pid_must_be_in_range(cls, id):
        try:
            with open("/proc/sys/kernel/pid_max") as f:
                pid_max = int(f.read().strip())
        except Exception:
            raise ValueError("Nem sikerült lekérdezni a pid_max értéket")

        if not (0 <= id <= pid_max):
            raise ValueError(f"pid értékének 0 és {pid_max} között kell lennie")
        return id

class StopTeleoperateResponse(BaseModel):
    status: str
    pid: int

@app.post("/stop-teleoperate", response_model=StopTeleoperateResponse, tags=["control"])
async def stop_teleoperate(param: StopTeleoperateParams):
    global process
    try:
        if process is None or process.poll() is not None:
            return {"status": "not running", "pid": 0, "message": "No teleoperate has been started yet."}

        if param.pid != process.pid:
            raise HTTPException(status_code=400, detail=f"PID error: no process found with {param.pid}")

        os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        process.wait()
        stopped_pid = process.pid
        process = None

        return {"status": "stopped", "pid": stopped_pid, "message": "Teleoperate has stopped"}

    except HTTPException:
        raise
    except Exception as e:
        return {"status": "error", "pid": 0, "message": str(e)}
