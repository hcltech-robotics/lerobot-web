from typing import List

from pydantic import BaseModel


class ListCamerasResponse(BaseModel):
    cameras: List[int]
