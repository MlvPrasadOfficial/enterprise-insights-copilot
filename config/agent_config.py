from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import os

@dataclass
class AgentConfig:
    name: str
    description: str
    enabled: bool = True
    model: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    extra: Dict[str, Any] = field(default_factory=dict)


def load_agent_configs_from_env() -> List[AgentConfig]:
    # Example: load agent enable/disable from env, fallback to default
    agent_names = os.getenv("AGENT_NAMES", "retriever,analyst,critic,debate").split(",")
    configs = []
    for name in agent_names:
        enabled = os.getenv(f"{name.upper()}_ENABLED", "true").lower() == "true"
        model = os.getenv(f"{name.upper()}_MODEL", None)
        temperature = os.getenv(f"{name.upper()}_TEMPERATURE", None)
        max_tokens = os.getenv(f"{name.upper()}_MAX_TOKENS", None)
        configs.append(
            AgentConfig(
                name=name,
                description=f"Config for {name} agent",
                enabled=enabled,
                model=model,
                temperature=float(temperature) if temperature else None,
                max_tokens=int(max_tokens) if max_tokens else None,
            )
        )
    return configs
