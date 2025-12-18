import re


def sanitize_repo_name(name: str) -> str:
    """
    Sanitize a string to be used as a repository name.
    Removes or replaces characters that are not allowed in repository names.
    """
    # Replace spaces with underscores
    name = name.replace(" ", "_")
    # Remove any character that is not alphanumeric, underscore, hyphen
    name = re.sub(r"[^a-zA-Z0-9_\-]", "", name)
    # Limit length to 50 characters
    return name[:50]
