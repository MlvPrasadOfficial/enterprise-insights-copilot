"""
InsightAgent: Generates natural language insights for a DataFrame using profiling and LLM.
"""

from backend.agents.base_agent import BaseAgent
import pandas as pd
import json
import os
from openai import OpenAI
from config.settings import load_prompt
from backend.core.tracing import traced
from backend.core.logging import logger
from typing import Any, Dict, Optional, List

openai_api_key = os.getenv("OPENAI_API_KEY")


class InsightAgent(BaseAgent):
    name = "InsightAgent"
    role = "Generates natural language insights for a DataFrame."

    def __init__(self, config=None):
        """
        Initialize the InsightAgent with configuration.
        Args:
            config: Optional configuration dictionary.
        """
        super().__init__(config)
        self.df = None
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
        self.df = data
        logger.info(f"[{self.name}] Pre-processing with DataFrame shape: {data.shape}")
        return context

    @traced(name="insight_agent_execute")
    def _execute(self, query: str, data: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Execute the insight generation based on the query and data.
        
        Args:
            query (str): The user's question or instructions.
            data (pd.DataFrame): The DataFrame to analyze.
            **kwargs: Additional parameters.
            
        Returns:
            Dict[str, Any]: The insights generated from the data.
        """
        try:
            # Generate data profile for insights
            profile = self._create_data_profile(data)
            
            # Generate insights based on the profile and query
            insights = self._generate_insights(query, profile)
            
            # Extract key patterns and findings
            key_findings = self._extract_key_findings(insights)
            
            # Gather token usage statistics if available
            token_usage = kwargs.get("token_usage", {})
            if token_usage:
                self._metrics.token_usage = token_usage
                self._metrics.prompt_tokens = token_usage.get("prompt_tokens", 0)
                self._metrics.completion_tokens = token_usage.get("completion_tokens", 0)
                self._metrics.total_tokens = token_usage.get("total_tokens", 0)
                
            return {
                "insights": insights,
                "key_findings": key_findings,
                "data_profile": profile,
                "token_usage": token_usage
            }
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in _execute: {str(e)}")
            return {"error": str(e), "partial_insights": "Unable to generate complete insights"}
            
    def _create_data_profile(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Create a comprehensive profile of the DataFrame for insight generation.
        
        Args:
            df (pd.DataFrame): The DataFrame to profile.
            
        Returns:
            Dict[str, Any]: Dictionary with profile information.
        """
        try:
            # Basic DataFrame information
            profile = {
                "columns": list(df.columns),
                "shape": df.shape,
                "dtypes": {col: str(dtype) for col, dtype in zip(df.columns, df.dtypes)},
            }
            
            # Summary statistics for numeric columns
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            if numeric_cols:
                profile["numeric_stats"] = df[numeric_cols].describe().to_dict()
            
            # Distribution of categorical columns
            categorical_cols = df.select_dtypes(include=['object', 'category', 'bool']).columns.tolist()
            if categorical_cols and len(df) > 0:
                profile["categorical_counts"] = {
                    col: df[col].value_counts().to_dict() for col in categorical_cols
                }
                
            # Missing value information
            profile["missing"] = df.isnull().sum().to_dict()
            profile["missing_percent"] = (df.isnull().mean() * 100).to_dict()
            
            # Correlation between numeric columns if multiple exist
            if len(numeric_cols) > 1:
                profile["correlations"] = df[numeric_cols].corr().to_dict()
                
            return profile
            
        except Exception as e:
            logger.error(f"[{self.name}] Error creating data profile: {str(e)}")
            # Return basic profile on error
            return {"columns": list(df.columns), "shape": df.shape}

    @traced(name="generate_insights")
    def _generate_insights(self, query: str, profile: Dict[str, Any]) -> str:
        """
        Generate insights from the data profile using LLM.
        
        Args:
            query (str): The user's query to guide insight generation.
            profile (Dict[str, Any]): The data profile.
            
        Returns:
            str: The generated insights text.
        """
        logger.info(f"[{self.name}] Generating insights for query: {query}")
        
        try:
            # Load the insight generation prompt template
            template = load_prompt("config/prompts/insight_prompt.txt")
            
            # Format the prompt with profile and query
            prompt = template.format(
                profile=json.dumps(profile, indent=2),
                query=query if query else "Generate comprehensive insights about this data."
            )

            # Call the LLM to generate insights
            client = OpenAI(api_key=openai_api_key)
            response = client.chat.completions.create(
                model=self.config.model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Extract insights from response
            insights = response.choices[0].message.content.strip()
            logger.info(f"[{self.name}] Generated insights: {insights[:100]}...")
            
            # Update token usage metrics
            if hasattr(response, "usage") and response.usage:
                self._metrics.token_usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
                
            return insights
            
        except Exception as e:
            logger.error(f"[{self.name}] Error generating insights: {str(e)}")
            return f"Error generating insights: {str(e)}"
            
    def _extract_key_findings(self, insights_text: str) -> List[str]:
        """
        Extract key findings from the generated insights text.
        
        Args:
            insights_text (str): The generated insights text.
            
        Returns:
            List[str]: List of key findings extracted from the text.
        """
        try:
            # Split text into paragraphs
            paragraphs = insights_text.split('\n\n')
            
            # Extract bullet points if any exist
            bullet_findings = []
            for paragraph in paragraphs:
                lines = paragraph.splitlines()
                for line in lines:
                    line = line.strip()
                    if line.startswith('- ') or line.startswith('• '):
                        bullet_findings.append(line[2:])
                        
            # If no bullet points found, create finding from first sentence of each paragraph
            if not bullet_findings:
                findings = []
                for paragraph in paragraphs:
                    if paragraph.strip():
                        # Get first sentence
                        sentences = paragraph.split('.')
                        if sentences:
                            finding = sentences[0].strip() + '.'
                            findings.append(finding)
                return findings[:5]  # Return up to 5 findings
            
            return bullet_findings
            
        except Exception as e:
            logger.error(f"[{self.name}] Error extracting key findings: {str(e)}")
            return ["Unable to extract key findings from insights."]
