"""
CritiqueAgent: Evaluates LLM answers for correctness, hallucinations, and dataset relevance.
"""

from backend.agents.base_agent import BaseAgent
from typing import List, Dict, Any, Optional
import os
import json
from openai import OpenAI
from backend.core.logging import logger
from backend.core.tracing import traced
import pandas as pd

openai_api_key = os.getenv("OPENAI_API_KEY")


class CritiqueAgent(BaseAgent):
    name = "CritiqueAgent"
    role = "Evaluates LLM answers for correctness, hallucinations, and dataset relevance."

    def __init__(self, config=None):
        """
        Initialize CritiqueAgent with configuration.
        Args:
            config: Optional configuration dictionary.
        """
        super().__init__(config)
        self.data_columns = []
        logger.info(f"[{self.name}] Initialized")

    def pre_process(self, query: str, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Pre-processing hook executed before main logic.
        Args:
            query: The user's question
            data: The DataFrame or data to evaluate
            **kwargs: Additional context (including answer to critique)
        Returns:
            Dict with preprocessing results
        """
        context = super().pre_process(query, data, **kwargs)
        
        # Extract data columns for reference
        if isinstance(data, pd.DataFrame):
            self.data_columns = list(data.columns)
        elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            self.data_columns = list(data[0].keys())
            
        logger.info(f"[{self.name}] Pre-processing with columns: {self.data_columns}")
        
        # Extract answer to critique from context if not explicitly provided
        if "answer" not in kwargs and "context" in kwargs:
            context_data = kwargs.get("context", {})
            # Try to find answer in agent outputs
            for agent_name, output in context_data.items():
                if isinstance(output, dict) and "output" in output:
                    context["answer"] = output.get("output")
                    break
                    
        return context
        
    @traced(name="critique_agent_execute")
    def _execute(self, query: str, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Evaluate an LLM answer for hallucinations, mistakes, and dataset relevance.
        
        Args:
            query (str): The user's original query.
            data (Any): The data for reference.
            **kwargs: Additional parameters including answer to critique.
            
        Returns:
            Dict[str, Any]: Evaluation result with confidence, flags, issues, and advice.
        """
        try:
            # Get answer to critique
            answer = kwargs.get("answer")
            available_columns = kwargs.get("available_columns", self.data_columns)
            
            # If no answer is provided, try to extract from context
            if not answer:
                context = kwargs.get("context", {})
                sql_agent_output = context.get("SQLAgent", {})
                answer = sql_agent_output.get("output", None)
                available_columns = sql_agent_output.get("available_columns", available_columns)
                
            # If still no answer, return error
            if not answer:
                return {
                    "error": "No answer provided for critique",
                    "confidence": "Low",
                    "flagged": True,
                    "issues": ["Missing content to evaluate"]
                }
                
            # Create data summary for context
            data_summary = self._create_data_summary(data)
            
            # Build prompt for LLM evaluation
            prompt = self._build_critique_prompt(query, answer, data_summary)
            
            # Perform evaluation with LLM
            evaluation = self._perform_llm_evaluation(prompt)
            
            # Add available columns to advice if provided
            if available_columns:
                advice = evaluation.get("advice", "")
                advice += f"\nAvailable columns in your data: {available_columns}"
                evaluation["advice"] = advice
                
            # Add metadata
            evaluation["evaluated_answer"] = answer[:200] + "..." if len(str(answer)) > 200 else answer
            
            return evaluation
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in _execute: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                "confidence": "Low",
                "flagged": True,
                "issues": [f"Evaluation failed: {str(e)}"],
                "advice": "Check response manually. The critique system encountered an error."
            }
            
    def _create_data_summary(self, data: Any) -> str:
        """
        Create a summary of the data for the LLM to check against.
        
        Args:
            data (Any): The data to summarize.
            
        Returns:
            str: A text summary of the data.
        """
        try:
            if isinstance(data, pd.DataFrame):
                # Show only top 5 rows for context
                return data.head(5).to_markdown()
            elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
                df = pd.DataFrame(data)
                return df.head(5).to_markdown()
            else:
                return str(data)[:500] + "..." if len(str(data)) > 500 else str(data)
        except Exception as e:
            logger.warning(f"[{self.name}] Could not summarize data: {e}")
            return str(data)[:500] + "..." if len(str(data)) > 500 else str(data)
            
    def _build_critique_prompt(self, query: str, answer: Any, data_summary: str) -> str:
        """
        Build the prompt for LLM to critique an answer.
        
        Args:
            query (str): The original user query.
            answer (Any): The answer to critique.
            data_summary (str): Summary of the data for reference.
            
        Returns:
            str: The formatted prompt.
        """
        return f"""
You are an LLM evaluation agent.

- Evaluate the following AI-generated answer for possible hallucinations or mistakes.
- Check if it references columns not present in the dataset.
- Check if the answer matches the actual data provided below. Only flag as hallucination if the answer does not match the data.
- Estimate confidence level (High/Medium/Low) and add a short explanation.

Available Columns: {self.data_columns}
Original Query: {query}
AI Response:
{answer}

Data (first 5 rows):
{data_summary}

Evaluation (JSON format):
{{
  "confidence": "",
  "flagged": false,
  "issues": [],
  "advice": ""
}}
"""

    def _perform_llm_evaluation(self, prompt: str) -> Dict[str, Any]:
        """
        Perform LLM evaluation using the provided prompt.
        
        Args:
            prompt (str): The evaluation prompt.
            
        Returns:
            Dict[str, Any]: Parsed evaluation results.
        """
        try:
            client = OpenAI(api_key=openai_api_key)
            response = client.chat.completions.create(
                model=self.config.model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Update token metrics
            if hasattr(response, "usage") and response.usage:
                self._metrics.token_usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
                self._metrics.prompt_tokens = response.usage.prompt_tokens
                self._metrics.completion_tokens = response.usage.completion_tokens
                self._metrics.total_tokens = response.usage.total_tokens
                
            content = response.choices[0].message.content.strip()
            
            # Extract JSON from response
            if content.startswith("```"):
                content = content.strip("`\n")
                if content.startswith("json"):
                    content = content[4:].strip()
                    
            # Parse JSON evaluation
            parsed = json.loads(content)
            logger.info(f"[{self.name}] Evaluation result: {parsed}")
            
            return parsed
            
        except json.JSONDecodeError as e:
            logger.error(f"[{self.name}] Failed to parse LLM response: {e}")
            # Return default structure on parse error
            return {
                "confidence": "Low",
                "flagged": True,
                "issues": ["Response format error: Could not parse LLM evaluation"],
                "advice": "The evaluation system could not properly analyze this response. Please check manually."
            }
        except Exception as e:
            logger.error(f"[{self.name}] LLM evaluation error: {e}")
            return {
                "confidence": "Low",
                "flagged": True,
                "issues": [f"Evaluation error: {str(e)}"],
                "advice": "The evaluation system encountered an error. Please check the response manually."
            }
