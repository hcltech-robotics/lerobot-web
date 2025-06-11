from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
import cv2
from .routers import status, teleoperate, websockets

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

app.include_router(status.router)
app.include_router(teleoperate.router)
app.include_router(websockets.router)