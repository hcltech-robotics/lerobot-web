from enum import Enum

from pydantic import BaseModel


class RobotType(str, Enum):
    SO100 = "so100"
    SO101 = "so101"
