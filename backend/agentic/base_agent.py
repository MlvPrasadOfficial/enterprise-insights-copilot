from typing import Any, Dict

class BaseAgent:
    name: str = "BaseAgent"
    description: str = "Generic agent"

    def run(self, query: str, data: Any, **kwargs) -> Dict:
        """Override this method in subclasses."""
        raise NotImplementedError
