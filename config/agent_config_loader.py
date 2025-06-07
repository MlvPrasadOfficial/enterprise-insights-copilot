import os
import yaml
import json
from config.agent_config import AgentConfig

CONFIG_PATHS = [
    os.path.join(os.path.dirname(__file__), "agent_config.yaml"),
    os.path.join(os.path.dirname(__file__), "agent_config.json"),
]

def load_agent_configs():
    for path in CONFIG_PATHS:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                if path.endswith(".yaml") or path.endswith(".yml"):
                    data = yaml.safe_load(f)
                else:
                    data = json.load(f)
            # Validate required fields
            for agent in data.get("agents", []):
                if not all(k in agent for k in ("name", "description", "enabled")):
                    raise ValueError(f"Agent config missing required fields: {agent}")
            return [AgentConfig(**agent) for agent in data.get("agents", [])]
    # fallback to env/dataclass loader
    from config.agent_config import load_agent_configs_from_env
    return load_agent_configs_from_env()
