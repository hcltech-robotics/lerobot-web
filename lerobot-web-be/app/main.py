from app.routes import (
    ai_control,
    calibrate,
    camera,
    joint_state,
    move_to_sleep,
    record,
    robots,
    teleoperate,
    groot
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="HCLTech Robot Dojo Backend",
    summary="This is a backend service for web control of the HCLTech Robot Dojo",
    version="0.0.1",
)

origins = [
    "*",
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
app.include_router(ai_control.router)
app.include_router(record.router)
app.include_router(groot.router)
