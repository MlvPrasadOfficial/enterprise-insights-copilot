import importlib
import pkgutil
import os
from typing import Type, List
from backend.agentic.base_agent import BaseAgent

AGENT_MODULE_PATH = "backend.agents"
AGENT_DIR = os.path.join(os.path.dirname(__file__), "..", "agents")


def discover_agents() -> List[Type[BaseAgent]]:
    agents = []
    for _, module_name, _ in pkgutil.iter_modules([AGENT_DIR]):
        try:
            module = importlib.import_module(f"backend.agents.{module_name}")
            for attr in dir(module):
                obj = getattr(module, attr)
                if (
                    isinstance(obj, type)
                    and issubclass(obj, BaseAgent)
                    and obj is not BaseAgent
                ):
                    agents.append(obj)
        except Exception as e:
            print(f"[AgentRegistry] Failed to import {module_name}: {e}")
    return agents
