import os
import sys
from dotenv import load_dotenv
import yaml

def validate_env(required_keys):
    load_dotenv()
    missing = []
    for key in required_keys:
        if not os.getenv(key):
            missing.append(key)
    if missing:
        print(f"[ERROR] Missing required environment variables: {', '.join(missing)}")
        sys.exit(1)
    print("[OK] All required environment variables are set.")

def validate_agent_config(path="config/agent_config.yaml"):
    if not os.path.exists(path):
        print(f"[WARN] {path} not found, skipping agent config validation.")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    agents = data.get("agents", [])
    required_fields = {"name", "description", "enabled"}
    for agent in agents:
        missing = required_fields - set(agent.keys())
        if missing:
            print(f"[ERROR] Agent config missing fields: {missing} in {agent}")
            sys.exit(1)
    print("[OK] Agent config YAML is valid.")

if __name__ == "__main__":
    REQUIRED = [
        "OPENAI_API_KEY",
        "LANGSMITH_ENDPOINT",
        "LANGSMITH_API_KEY",
    ]
    validate_env(REQUIRED)
    validate_agent_config()
