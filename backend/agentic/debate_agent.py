from config.agent_config import AgentConfig
from config.constants import VERBOSE
from openai import OpenAI
from config.config import get_env_var

openai_api_key = get_env_var("OPENAI_API_KEY", required=True)
client = OpenAI(api_key=openai_api_key)

class DebateAgent:
    name = "DebateAgent"
    description = "Presents multiple perspectives and debates answers."
    config: AgentConfig = AgentConfig(
        name="debate",
        description="Presents multiple perspectives and debates answers.",
        enabled=True,
        model=None,
        temperature=None,
        max_tokens=None,
    )
    def run(self, query: str, data: any = None, context=None, **kwargs):
        if VERBOSE:
            print(f"[DebateAgent] Running with config: {self.config}")
        # Example: Use LLM to arbitrate between two answers
        answer_a = context.get("CritiqueAgent", {}).get("output", "A") if context else "A"
        answer_b = context.get("SQLAgent", {}).get("output", "B") if context else "B"
        prompt = f"Debate between two answers:\nA: {answer_a}\nB: {answer_b}\nWho is more correct and why?"
        try:
            response = client.chat.completions.create(
                model=self.config.model or "gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=self.config.temperature or 0.2,
                max_tokens=self.config.max_tokens or 256,
            )
            debate_result = response.choices[0].message.content
        except Exception as e:
            debate_result = f"[DebateAgent] Error: {e}"
        result = {
            "agent": self.name,
            "description": self.description,
            "output": debate_result,
            "config": self.config.__dict__,
        }
        return result
