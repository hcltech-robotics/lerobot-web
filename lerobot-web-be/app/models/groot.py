from pydantic import BaseModel, constr


class GrootRequest(BaseModel):
    robot_port: constr(min_length=1)
    robot_type: constr(min_length=1)
    lang_instruction: constr(min_length=1)


class GrootResponse(BaseModel):
    started: bool
    pid: int


class GrootStatusResponse(BaseModel):
    running: bool
    pid: int | None = None
