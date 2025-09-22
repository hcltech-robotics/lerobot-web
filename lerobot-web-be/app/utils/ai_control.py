import numpy as np
import torch

JOINT_ORDER = [
    "shoulder_pan",
    "shoulder_lift",
    "elbow_flex",
    "wrist_flex",
    "wrist_roll",
    "gripper",
]


def tensor_to_joint_dict(tensor):
    values = tensor.squeeze().tolist()
    return dict(zip(JOINT_ORDER, values))


def build_batch_for_obs(obs: dict, images: dict, policy, device: str = "cpu") -> dict:
    batch = {}
    cfg = getattr(policy, "config", None)

    state_vec = np.array(
        [
            obs["shoulder_pan.pos"],
            obs["shoulder_lift.pos"],
            obs["elbow_flex.pos"],
            obs["wrist_flex.pos"],
            obs["wrist_roll.pos"],
            obs["gripper.pos"],
        ],
        dtype=np.float32,
    )
    batch["observation.state"] = torch.tensor(state_vec).unsqueeze(0).to(device)

    if hasattr(cfg, "input_features"):
        for k, feature in getattr(cfg, "input_features", {}).items():
            if k.startswith("observation.images"):
                cam_name = k.split(".")[-1]
                img = images.get(cam_name)

                shape = getattr(feature, "shape", [3, 480, 640])
                if img is None:
                    batch[k] = torch.zeros((1, *shape), dtype=torch.float32).to(device)
                else:
                    arr = img.astype(np.float32) / 255.0
                    arr = np.transpose(arr, (2, 0, 1))  # HWC -> CHW
                    batch[k] = (
                        torch.tensor(arr, dtype=torch.float32).unsqueeze(0).to(device)
                    )
    return batch
