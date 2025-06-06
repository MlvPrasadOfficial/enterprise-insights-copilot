# Environment variables and model config

import os


def load_prompt(path: str) -> str:
    # If path is not absolute, resolve relative to project root
    if not os.path.isabs(path):
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        path = os.path.join(project_root, path)
    with open(path, "r", encoding="utf-8") as file:
        return file.read()
