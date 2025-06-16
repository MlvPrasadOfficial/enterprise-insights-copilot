"""
DebateAgent: Runs a multi-agent debate among Insight, SQL, Chart agents and uses LLM to arbitrate the best answer.
"""

from backend.agents.base_agent import BaseAgent
from backend.agents.insight_agent import InsightAgent
from backend.agents.sql_agent import SQLAgent
from backend.agents.chart_agent import ChartAgent
from backend.agents.critique_agent import CritiqueAgent
from backend.core.logging import logger
from backend.core.tracing import traced
from openai import OpenAI
import os
import json
from typing import Any, Dict, List
import pandas as pd
import time

openai_api_key = os.getenv("OPENAI_API_KEY")


class DebateAgent(BaseAgent):
    name = "DebateAgent"
    role = "Orchestrates a debate among agents and arbitrates the best answer"

    def __init__(self, config=None):
        """
        Initialize DebateAgent with configuration.
        Args:
            config: Optional configuration dictionary.
        """
        super().__init__(config)
        self.df = None
        self.columns = []
        self.agents = []
        logger.info(f"[{self.name}] Initialized")

    def pre_process(self, query: str, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Pre-processing hook executed before main logic.
        Args:
            query: The user's question
            data: The DataFrame to analyze
            **kwargs: Additional context
        Returns:
            Dict with preprocessing results
        """
        context = super().pre_process(query, data, **kwargs)
        # Set up debate context
        self.df = data
        self.columns = data.columns.tolist()
        logger.info(f"[{self.name}] Pre-processing with DataFrame shape: {data.shape}")

        # Initialize other agents
        self.agents = {
            "InsightAgent": InsightAgent(self.config),
            "SQLAgent": SQLAgent(self.config),
            "ChartAgent": ChartAgent(self.config),
            "CritiqueAgent": CritiqueAgent(self.config)
        }
        
        return context

    @traced(name="debate_agent_execute")
    def _execute(self, query: str, data: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Run a debate among multiple agents and arbitrate with LLM.
        
        Args:
            query (str): The user's question in natural language.
            data (pd.DataFrame): The DataFrame to analyze.
            **kwargs: Additional parameters.
            
        Returns:
            Dict[str, Any]: Responses, evaluations, and final decision.
        """
        start_time = time.time()
        try:
            # Run all agents in sequence and collect responses
            responses = self._collect_agent_responses(query, data)
            logger.info(f"[{self.name}] Collected responses from all agents")
            
            # Critique all responses
            evaluations = self._evaluate_responses(query, responses)
            logger.info(f"[{self.name}] Completed evaluations of all responses")
            
            # Arbitrate to find the best answer
            decision = self._arbitrate(query, responses, evaluations)
            logger.info(f"[{self.name}] Arbitration complete")
            
            # Update execution time metric
            self._metrics.execution_time = time.time() - start_time
            
            return {
                "responses": responses,
                "evaluations": evaluations, 
                "decision": decision,
                "execution_time": self._metrics.execution_time
            }
        except Exception as e:
            logger.error(f"[{self.name}] Error in _execute: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                "error": f"Debate failed: {str(e)}",
                "partial_responses": self._get_partial_responses()
            }
    
    def _collect_agent_responses(self, query: str, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Collect responses from all participating agents.
        
        Args:
            query (str): The user's question.
            data (pd.DataFrame): The DataFrame to analyze.
            
        Returns:
            Dict[str, Any]: Responses from each agent.
        """
        responses = {}
        
        try:
            # Run InsightAgent
            insight_agent = self.agents["InsightAgent"]
            insight_result = insight_agent.run(query, data)
            responses["InsightAgent"] = insight_result.get("output", {}).get("insights", "No insights generated")
            
            # Run SQLAgent
            sql_agent = self.agents["SQLAgent"]
            sql_result = sql_agent.run(query, data)
            if "output" in sql_result and "result" in sql_result["output"]:
                # Convert to markdown for better readability
                import pandas as pd
                result_df = pd.DataFrame(sql_result["output"]["result"])
                sql_response = result_df.to_markdown() if not result_df.empty else "No results"
            else:
                sql_response = str(sql_result.get("output", "SQL query failed"))
            responses["SQLAgent"] = sql_response
            
            # Run ChartAgent
            chart_agent = self.agents["ChartAgent"]
            chart_result = chart_agent.run(query, data)
            chart_type = chart_result.get("chart_type", "unknown")
            x = chart_result.get("x", "unknown")
            y = chart_result.get("y", "unknown")
            responses["ChartAgent"] = f"A {chart_type} chart of {y} vs {x} was suggested."
            
        except Exception as e:
            logger.error(f"[{self.name}] Error collecting agent responses: {e}")
            responses["error"] = f"Error collecting all agent responses: {str(e)}"
            
        return responses
    
    def _evaluate_responses(self, query: str, responses: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate all agent responses using CritiqueAgent.
        
        Args:
            query (str): The user's question.
            responses (Dict[str, Any]): Agent responses.
            
        Returns:
            Dict[str, Any]: Evaluation for each response.
        """
        evaluations = {}
        critique_agent = self.agents["CritiqueAgent"]
        
        for name, response in responses.items():
            if name == "error":
                continue
                
            try:
                critique_result = critique_agent.run(query, self.df, answer=response)
                if "output" in critique_result:
                    evaluations[name] = critique_result["output"]
                else:
                    evaluations[name] = {"error": "Critique failed"}
            except Exception as e:
                logger.error(f"[{self.name}] Error evaluating {name} response: {e}")
                evaluations[name] = {"error": f"Evaluation error: {str(e)}"}
                
        return evaluations
                
    @traced(name="debate_arbitration")
    def _arbitrate(self, query: str, responses: Dict[str, Any], 
                 evaluations: Dict[str, Any]) -> Dict[str, Any]:
        """
        Arbitrate between different agent responses to determine the best answer.
        
        Args:
            query (str): The user's question.
            responses (Dict[str, Any]): Agent responses.
            evaluations (Dict[str, Any]): Critiques of each response.
            
        Returns:
            Dict[str, Any]: Arbitration decision.
        """
        try:
            # Prepare decision prompt for arbitration
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
            # Call LLM for arbitration
            client = OpenAI(api_key=openai_api_key)
            response = client.chat.completions.create(
                model=self.config.model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                messages=[{"role": "user", "content": decision_prompt}]
            )
            
            # Update token usage metrics
            if hasattr(response, "usage") and response.usage:
                self._metrics.token_usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
                self._metrics.prompt_tokens = response.usage.prompt_tokens
                self._metrics.completion_tokens = response.usage.completion_tokens
                self._metrics.total_tokens = response.usage.total_tokens
                
            # Process arbitration response
            content = response.choices[0].message.content.strip()
            
            # Extract JSON from response
            if content.startswith("```"):
                content = content.strip("`\n")
                if content.startswith("json"):
                    content = content[4:].strip()
                    
            # Parse JSON decision
            try:
                parsed = json.loads(content)
                logger.info(f"[{self.name}] Arbitration result: {parsed}")
                return parsed
            except json.JSONDecodeError:
                logger.error(f"[{self.name}] Failed to parse arbitration response as JSON")
                # Return text response if JSON parsing fails
                return {
                    "winner": "None",
                    "reason": "Failed to parse arbitration response",
                    "corrected": content
                }
                
        except Exception as e:
            logger.error(f"[{self.name}] Arbitration error: {str(e)}")
            return {
                "winner": "None",
                "reason": f"Arbitration error: {str(e)}",
                "corrected": "No agent provided a satisfactory response."
            }
            
    def _get_partial_responses(self) -> Dict[str, Any]:
        """
        Get any partial responses that were collected before an error occurred.
        
        Returns:
            Dict[str, Any]: Partial responses from agents.
        """
        # This would track partial results in a real implementation
        return {"status": "Debate did not complete"}
