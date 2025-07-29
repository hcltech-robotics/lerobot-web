from fastapi import FastAPI

from app.routers import joint_state, move_to_sleep, teleoperate

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Backend running."}


app.include_router(joint_state.router)
app.include_router(move_to_sleep.router)
app.include_router(teleoperate.router)
