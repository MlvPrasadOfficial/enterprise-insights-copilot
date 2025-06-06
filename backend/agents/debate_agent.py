from backend.agents.insight_agent import InsightAgent
from backend.agents.sql_agent import SQLAgent
from backend.agents.chart_agent import ChartAgent
from backend.agents.critique_agent import CritiqueAgent
from backend.core.session_memory import memory
from backend.core.logging import logger
from openai import OpenAI
import os
import json

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

class DebateAgent:
    def __init__(self, df):
        self.df = df
        self.columns = df.columns.tolist()

    def run_debate(self, query: str):
        insight = InsightAgent(self.df).generate_summary()
        sql_agent = SQLAgent(self.df)
        sql = sql_agent.generate_sql(query)
        sql_result = sql_agent.run_sql(sql).to_markdown()
        chart_agent = ChartAgent(self.df)
        x, y = chart_agent.guess_axes()
        chart_type = chart_agent.guess_chart(query)
        chart_response = f"A {chart_type} chart of {y} vs {x} was suggested."

        responses = {
            "InsightAgent": insight,
            "SQLAgent": sql_result,
            "ChartAgent": chart_response
        }

        critique = CritiqueAgent(self.columns)
        evaluations = {name: critique.evaluate(query, ans) for name, ans in responses.items()}

        # Prepare decision prompt
        decision_prompt = f"""You are an LLM arbiter.
All agent responses are below, including critiques.

Question: {query}

Agent Responses:
{json.dumps(responses, indent=2)}

Critiques:
{json.dumps(evaluations, indent=2)}

If all responses are flawed or insufficient, generate a corrected answer yourself.

Respond in JSON:
{{
  "winner": "<AgentName or 'None'>",
  "reason": "<reason>",
  "corrected": "<if no good answer, rewrite the response>"
}}
"""

        final = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": decision_prompt}]
        )

        decision_text = final.choices[0].message.content.strip()
        parsed_decision = eval(decision_text)

        return {
            "responses": responses,
            "evaluations": evaluations,
            "decision": parsed_decision
        }
