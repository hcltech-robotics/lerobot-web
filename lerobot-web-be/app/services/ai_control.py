import asyncio
import logging
import time
from typing import Optional

import cv2
import torch
from lerobot.policies.act.modeling_act import ACTPolicy
from lerobot.policies.diffusion.modeling_diffusion import DiffusionPolicy
from lerobot.policies.pi0.modeling_pi0 import PI0Policy
from lerobot.robots.so100_follower import SO100Follower, SO100FollowerConfig

from ..models.ai_control import AIControlParams
from ..utils.ai_control import build_batch_for_obs, tensor_to_joint_dict

logger = logging.getLogger(__name__)


def select_policy(policy_type: str, model_id: str, hf_token: str = ""):
    if policy_type == "diff":
        policy = DiffusionPolicy.from_pretrained(model_id, token=hf_token)
    elif policy_type == "pi0":
        policy = PI0Policy.from_pretrained(model_id, token=hf_token)
    elif policy_type == "act":
        policy = ACTPolicy.from_pretrained(model_id, token=hf_token)
    else:
        raise ValueError(f"Unknown policy_type: {policy_type}")

    device = (
        "mps"
        if torch.backends.mps.is_available()
        else "cuda" if torch.cuda.is_available() else "cpu"
    )
    policy.to(device).eval()
    return policy, device


async def replay_loop(params: AIControlParams, stop_event: asyncio.Event):
    """Async replay loop (worker task)."""
    policy, device = select_policy(params.policy_type, params.model_id, params.hf_token)

    cfg = SO100FollowerConfig(port=params.robot_port, use_degrees=True)
    robot = SO100Follower(cfg)
    robot.connect(calibrate=False)
    if not robot.is_connected:
        raise RuntimeError("Error while connecting to robot arm")

    logger.info("Motors on bus: %s", robot.bus.motors.keys())

    cams = {cam.name: cv2.VideoCapture(int(cam.camera_id)) for cam in params.cameras}

    period = 1.0 / max(1, params.fps)

    try:
        repeat_counter = 0
        while not stop_event.is_set():
            t0 = time.perf_counter()

            obs = robot.get_observation()

            images = {}
            for name, cap in cams.items():
                ret, frame = cap.read()
                if ret:
                    images[name] = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                else:
                    images[name] = None

            batch = build_batch_for_obs(obs, images, policy, device)

            with torch.no_grad():
                action = policy.select_action(batch)

            action_to_send = tensor_to_joint_dict(action)
            logger.info("GOAL_POS (deg): %s", action_to_send)

            action_dict = {f"{k}.pos": v for k, v in action_to_send.items()}
            robot.send_action(action_dict)

            repeat_counter += 1
            if params.repeat_count > 0 and repeat_counter >= params.repeat_count:
                logger.info("Repeat count reached, stopping loop.")
                break

            dt = time.perf_counter() - t0
            if dt < period:
                await asyncio.sleep(period - dt)

    finally:
        logger.info("Disconnecting robot & releasing cameras")
        robot.disconnect()
        for cap in cams.values():
            cap.release()


class AIControlManager:
    def __init__(self):
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.stop_event: Optional[asyncio.Event] = None

    async def start(self, params: AIControlParams):
        if self.running:
            return {"status": "error", "message": "AI control already running"}

        self.stop_event = asyncio.Event()
        self.task = asyncio.create_task(replay_loop(params, self.stop_event))
        self.running = True
        return {"status": "ok", "message": "AI control started"}

    async def stop(self):
        if not self.running or not self.task:
            return {"status": "error", "message": "No AI control running"}
        if self.stop_event is not None:
            self.stop_event.set()
        await self.task
        self.running = False
        self.task = None
        self.stop_event = None
        return {"status": "ok", "message": "AI control stopped"}


ai_control_manager = AIControlManager()
