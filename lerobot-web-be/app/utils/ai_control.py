import os

from huggingface_hub import snapshot_download
from lerobot.policies.diffusion.modeling_diffusion import DiffusionPolicy


def download_and_load_policy(model_name: str):
    # Provide the [hugging face repo id]
    pretrained_policy_path = model_name
    policy = DiffusionPolicy.from_pretrained(pretrained_policy_path)

    return policy
