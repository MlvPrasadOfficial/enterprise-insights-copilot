"""
NarrativeAgent: Synthesizes analysis results into coherent narratives with different styles.
"""

from backend.agents.base_agent import BaseAgent
from typing import Any, Dict, List, Optional
from config.agent_config import AgentConfig
from config.constants import VERBOSE
import pandas as pd
from openai import OpenAI
import os
from config.settings import load_prompt
from backend.core.logging import logger
import json

class NarrativeAgent(BaseAgent):
    name = "NarrativeAgent"
    description = "Summarizes the results of the analysis, critique, and chart into a narrative."
    config: AgentConfig = AgentConfig(
        name="narrative",
        description="Summarizes the results of the analysis, critique, and chart into a narrative.",
        enabled=True,
        model=None,
        temperature=None,
        max_tokens=None,
    )
    
    NARRATIVE_STYLES = {
        "executive": "Executive summary style focusing on key insights and business impact",
        "technical": "Technical analysis with detailed explanations of methods and findings",
        "educational": "Educational style explaining concepts and insights in an accessible way",
        "conversational": "Casual, conversational tone suitable for general audiences",
        "visual": "Narrative focused on describing visual elements and patterns in the data"
    }

    def __init__(self, config=None):
        """Initialize NarrativeAgent with optional configuration"""
        super().__init__(config)
        logger.info(f"[{self.name}] Initialized with config: {self.config}")
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
    def _execute(self, query: str, data: Any = None, **kwargs) -> Dict[str, Any]:
        """
        Generate a narrative summary based on analysis results.
        Args:
            query: User's question
            data: Optional data for reference
            **kwargs: Additional context including analysis results
        Returns:
            Dict with generated narrative
        """
        context = kwargs.get("context", {})
        
        # Determine the narrative style based on query or default to executive
        style = self._determine_style(query)
        
        # Extract results from agents
        analysis = context.get("SQLAgent", {}).get("output") if context else None
        critique = context.get("CritiqueAgent", {}).get("output") if context else None
        chart_data = context.get("ChartAgent", {}).get("output") if context else None
        
        # Generate narrative
        try:
            narrative = self._generate_narrative(query, analysis, critique, chart_data, style)
            
            return {
                "narrative": narrative,
                "style": style,
                "sections": self._extract_sections(narrative),
                "sources": self._get_source_references(context)
            }
        except Exception as e:
            logger.error(f"[{self.name}] Error generating narrative: {str(e)}")
            return {
                "error": f"Failed to generate narrative: {str(e)}",
                "fallback_narrative": "Analysis complete. Please refer to the detailed results from each agent for insights."
            }
    
    def _determine_style(self, query: str) -> str:
        """Determine the best narrative style based on the query"""
        query_lower = query.lower()
        
        if "executive" in query_lower or "summary" in query_lower:
            return "executive"
        elif "technical" in query_lower or "detailed" in query_lower:
            return "technical"
        elif "teach" in query_lower or "explain" in query_lower:
            return "educational"
        elif "casual" in query_lower or "conversation" in query_lower:
            return "conversational"
        elif "visual" in query_lower or "chart" in query_lower:
            return "visual"
        else:
            # Default to executive
            return "executive"
            
    def _get_source_references(self, context: Dict) -> List[Dict]:
        """Extract source references from agent outputs"""
        sources = []
        
        # Add SQL source if available
        if "SQLAgent" in context and context["SQLAgent"].get("output"):
            sql_output = context["SQLAgent"]["output"]
            if isinstance(sql_output, dict) and "sql" in sql_output:
                sources.append({
                    "type": "sql",
                    "label": "SQL Query",
                    "content": sql_output["sql"]
                })
            
        # Add chart source if available
        if "ChartAgent" in context and context["ChartAgent"].get("output"):
            chart_output = context["ChartAgent"]["output"]
            if isinstance(chart_output, dict):
                chart_info = {
                    "type": "chart",
                    "label": "Data Visualization",
                    "chart_type": chart_output.get("chart_type", "unknown"),
                }
                
                # Add axis information if available
                if "x" in chart_output and "y" in chart_output:
                    chart_info["axes"] = f"{chart_output['x']} vs {chart_output['y']}"
                    
                sources.append(chart_info)
        
        return sources
            
    def _generate_narrative(
        self, 
        query: str, 
        analysis: Any, 
        critique: Any, 
        chart_data: Any, 
        style: str
    ) -> str:
        """
        Generate a narrative summary using LLM.
        Args:
            query: Original user query
            analysis: Results from analysis agent
            critique: Results from critique agent
            chart_data: Results from chart agent
            style: Narrative style to use
        Returns:
            str: Generated narrative
        """
        logger.info(f"[{self.name}] Generating {style} narrative")
        
        # Create formatted context for the LLM
        prompt_context = {
            "query": query,
            "analysis": self._format_analysis(analysis),
            "critique": self._format_critique(critique),
            "chart": self._format_chart_data(chart_data),
            "style": self.NARRATIVE_STYLES.get(style, "Executive summary style")
        }
        
        # Load narrative prompt template
        try:
            template = load_prompt("config/prompts/narrative_prompt.txt")
        except Exception:
            # Fallback template if file not found
            template = """
            You are a data narrative expert. Create a {style} narrative summarizing the analysis below.
            
            Query: {query}
            
            Analysis Results: {analysis}
            
            Chart Information: {chart}
            
            Quality Assessment: {critique}
            
            Generate a comprehensive narrative with sections for Introduction, Key Findings, and Conclusion.
            Make sure to highlight the most important insights and maintain a {style} tone throughout.
            """
        
        # Format the prompt
        prompt = template.format(**prompt_context)
        
        # Call the LLM
        response = self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=1500
        )
        
        return response.choices[0].message.content.strip()
    
    def _format_analysis(self, analysis: Any) -> str:
        """Format analysis data for the LLM prompt"""
        if not analysis:
            return "No analysis data available."
            
        if isinstance(analysis, str):
            return analysis
            
        if isinstance(analysis, dict):
            # Handle SQL results
            if "table_data" in analysis and isinstance(analysis["table_data"], list):
                rows = len(analysis["table_data"])
                sample = analysis["table_data"][:5] if rows > 5 else analysis["table_data"]
                return f"SQL analysis with {rows} rows of data. Sample: {json.dumps(sample, indent=2)}"
            
            # Handle insight results
            if "insights" in analysis:
                return analysis["insights"]
                
        # Fallback to string representation
        return str(analysis)
        
    def _format_critique(self, critique: Any) -> str:
        """Format critique data for the LLM prompt"""
        if not critique:
            return "No quality assessment available."
            
        if isinstance(critique, dict):
            parts = []
            
            # Extract confidence
            if "confidence" in critique:
                parts.append(f"Confidence: {critique['confidence']}")
                
            # Extract issues
            if "issues" in critique and critique["issues"]:
                issues = critique["issues"]
                if isinstance(issues, list):
                    parts.append(f"Issues identified: {', '.join(issues)}")
                else:
                    parts.append(f"Issues: {issues}")
                    
            # Extract advice
            if "advice" in critique:
                parts.append(f"Advice: {critique['advice']}")
                
            return " ".join(parts)
            
        return str(critique)
        
    def _format_chart_data(self, chart_data: Any) -> str:
        """Format chart data for the LLM prompt"""
        if not chart_data:
            return "No chart data available."
            
        if isinstance(chart_data, dict):
            parts = []
            
            # Chart type and axes
            chart_type = chart_data.get("chart_type", "unknown")
            x_axis = chart_data.get("x", "")
            y_axis = chart_data.get("y", "")
            
            parts.append(f"Chart type: {chart_type}")
            if x_axis and y_axis:
                parts.append(f"Shows {y_axis} (y-axis) relative to {x_axis} (x-axis)")
                
            # Add insights if available
            insights = chart_data.get("insights", {})
            if insights:
                if "statistics" in insights:
                    stats = insights["statistics"]
                    parts.append(f"Statistics: mean={stats.get('mean')}, median={stats.get('median')}, min={stats.get('min')}, max={stats.get('max')}")
                    
                if "trend" in insights:
                    trend = insights["trend"]
                    parts.append(f"Trend direction: {trend.get('direction')}, change: {trend.get('change')}, percent change: {trend.get('percent_change')}%")
                    
                if "correlation" in insights:
                    corr = insights["correlation"]
                    parts.append(f"Correlation: {corr} - {insights.get('interpretation', '')}")
                    
            return " ".join(parts)
            
        return str(chart_data)
        
    def _extract_sections(self, narrative: str) -> Dict[str, str]:
        """Extract structured sections from the narrative for easier frontend rendering"""
        sections = {
            "introduction": "",
            "key_findings": "",
            "conclusion": ""
        }
        
        # Extract introduction (content before the first heading)
        intro_end = narrative.lower().find("# key findings")
        if intro_end == -1:
            intro_end = narrative.lower().find("key findings")
        
        if intro_end != -1:
            sections["introduction"] = narrative[:intro_end].strip()
            
        # Extract key findings
        findings_start = narrative.lower().find("# key findings")
        if findings_start == -1:
            findings_start = narrative.lower().find("key findings")
            
        findings_end = narrative.lower().find("# conclusion")
        if findings_end == -1:
            findings_end = narrative.lower().find("conclusion")
            
        if findings_start != -1 and findings_end != -1:
            sections["key_findings"] = narrative[findings_start:findings_end].strip()
        elif findings_start != -1:
            sections["key_findings"] = narrative[findings_start:].strip()
            
        # Extract conclusion
        conclusion_start = narrative.lower().find("# conclusion")
        if conclusion_start == -1:
            conclusion_start = narrative.lower().find("conclusion")
            
        if conclusion_start != -1:
            sections["conclusion"] = narrative[conclusion_start:].strip()
            
        return sections

    def run(self, query: str, data: Any = None, context=None, **kwargs) -> Dict[str, Any]:
        """
        Run the narrative agent to generate a narrative summary.
        Args:
            query: User's question
            data: Optional data context
            context: Optional agent context with results from other agents
            **kwargs: Additional parameters
        Returns:
            Dict with generated narrative and metadata
        """
        if VERBOSE:
            print(f"[{self.name}] Running with config: {self.config}")
            
        return super().run(query, data, context=context, **kwargs)
