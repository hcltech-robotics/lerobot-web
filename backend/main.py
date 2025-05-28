from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os

app = FastAPI()

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

@app.post("/start-teleoperate")
def start_teleoperate():
    try:
        script_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../lerobot/lerobot/scripts/control_robot.py")
        )
        
        command = f"python {script_path} --robot.type=so100 --control.type=teleoperate --control.display_data=false --control.fps=30"

        env = os.environ.copy()

        result = subprocess.run(command, shell=True, capture_output=True, text=True, env=env, cwd="/home/jetson/lerobot")

        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        print("Return code:", result.returncode)
        return {"status": "started"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
