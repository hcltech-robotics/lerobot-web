from app.routes import (
    calibrate,
    camera,
    joint_state,
    move_to_sleep,
    robots,
    teleoperate,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    allow_headers=["*"],
)


class BackendStatusResponse(BaseModel):
    message: str


@app.get("/", response_model=BackendStatusResponse, tags=["status"])
def root():
    return {"message": "Backend running."}


app.include_router(joint_state.router)
app.include_router(move_to_sleep.router)
app.include_router(teleoperate.router)
app.include_router(camera.router)
app.include_router(robots.router)
app.include_router(calibrate.router)
