import time
from typing import Any, Callable, Optional

from lerobot.datasets.lerobot_dataset import LeRobotDataset
from lerobot.datasets.utils import build_dataset_frame
from lerobot.policies.pretrained import PreTrainedPolicy
from lerobot.processor import (
    PolicyAction,
    PolicyProcessorPipeline,
    RobotAction,
    RobotObservation,
    RobotProcessorPipeline,
)
from lerobot.robots import Robot
from lerobot.teleoperators.teleoperator import Teleoperator
from lerobot.utils.constants import ACTION, OBS_STR
from lerobot.utils.control_utils import predict_action
from lerobot.utils.robot_utils import busy_wait
from lerobot.utils.utils import get_safe_torch_device

from ..services.joint_state_manager import joint_state_manager
from ..utils.joint_state import remap_keys_for_client_and_convert_to_deg

ProgressCb = Callable[[dict], None]


def record_loop(
    *,
    robot: Robot,
    events: dict,
    fps: int,
    teleop_action_processor: RobotProcessorPipeline[
        tuple[RobotAction, RobotObservation], RobotAction
    ],
    robot_action_processor: RobotProcessorPipeline[
        tuple[RobotAction, RobotObservation], RobotAction
    ],
    robot_observation_processor: RobotProcessorPipeline[
        RobotObservation, RobotObservation
    ],
    dataset: Optional[LeRobotDataset] = None,
    teleop: Optional[Teleoperator] = None,
    policy: Optional[PreTrainedPolicy] = None,
    preprocessor: Optional[
        PolicyProcessorPipeline[dict[str, Any], dict[str, Any]]
    ] = None,
    postprocessor: Optional[PolicyProcessorPipeline[PolicyAction, PolicyAction]] = None,
    control_time_s: float = 60.0,
    single_task: Optional[str] = None,
    phase: str = "recording",
    # UI progress
    progress_cb: Optional[ProgressCb] = None,
    current_episode: int = 1,
    total_episodes: int = 1,
    follower_port: str,
):
    if dataset is not None and dataset.fps != fps:
        raise ValueError(f"dataset.fps must equal fps ({dataset.fps} != {fps})")

    if policy is not None and preprocessor is not None and postprocessor is not None:
        policy.reset()
        preprocessor.reset()
        postprocessor.reset()

    start_episode_t = time.perf_counter()
    last_progress_t = 0.0
    timestamp = 0.0

    while timestamp < control_time_s:
        start_loop_t = time.perf_counter()

        if events.get("exit_early"):
            events["exit_early"] = False
            break

        if events.get("stop_recording"):
            break

        obs = robot.get_observation()

        joint_state = remap_keys_for_client_and_convert_to_deg(obs)
        joint_state_manager.publish(follower_port, joint_state)

        obs_processed = robot_observation_processor(obs)

        if policy is not None or dataset is not None:
            observation_frame = build_dataset_frame(
                dataset.features, obs_processed, prefix=OBS_STR
            )

        # --- action ---
        act_processed_policy = None
        act_processed_teleop = None

        if (
            policy is not None
            and preprocessor is not None
            and postprocessor is not None
        ):
            action_values = predict_action(
                observation=observation_frame,
                policy=policy,
                device=get_safe_torch_device(policy.config.device),
                preprocessor=preprocessor,
                postprocessor=postprocessor,
                use_amp=policy.config.use_amp,
                task=single_task,
                robot_type=robot.robot_type,
            )
            action_names = dataset.features[ACTION]["names"]
            act_processed_policy = {
                f"{name}": float(action_values[i])
                for i, name in enumerate(action_names)
            }

        elif policy is None and teleop is not None:
            act = teleop.get_action()
            act_processed_teleop = teleop_action_processor((act, obs))

        else:
            # CLI-ben is continue van, reset loopnál teleop nélkül előfordulhat.
            # UI-ban ezt meghagyjuk CLI-kompatibilisen.
            continue

        # --- before send: robot processor ---
        if act_processed_policy is not None:
            action_values = act_processed_policy
            robot_action_to_send = robot_action_processor((act_processed_policy, obs))
        else:
            action_values = act_processed_teleop
            robot_action_to_send = robot_action_processor((act_processed_teleop, obs))

        robot.send_action(robot_action_to_send)

        # --- dataset write ---
        if dataset is not None:
            action_frame = build_dataset_frame(
                dataset.features, action_values, prefix=ACTION
            )
            frame = {**observation_frame, **action_frame, "task": single_task}
            dataset.add_frame(frame)

        # --- UI progress throttled ---
        now = time.perf_counter()
        if progress_cb and (now - last_progress_t) > 0.2:  # ~5 Hz
            elapsed = now - start_episode_t
            remaining = max(control_time_s - elapsed, 0.0)
            progress_cb(
                {
                    "phase": phase,
                    "current_episode": current_episode,
                    "total_episodes": total_episodes,
                    "episode_start_time": start_episode_t,
                    "time_left_s": round(remaining, 2),
                    "in_reset": phase == "resetting",
                    "is_running": True,
                    "episodes_left": max(total_episodes - current_episode, 0),
                }
            )
            last_progress_t = now

        dt_s = time.perf_counter() - start_loop_t
        busy_wait(1 / fps - dt_s)
        timestamp = time.perf_counter() - start_episode_t
