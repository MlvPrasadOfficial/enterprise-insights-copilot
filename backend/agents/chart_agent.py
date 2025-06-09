from backend.agents.base_agent import BaseAgent
import pandas as pd
import altair as alt
from backend.core.logging import logger
from typing import Tuple, Any, Dict
from config.agent_config import AgentConfig
from config.constants import VERBOSE
from backend.core.models import get_openai_client
from config.settings import load_prompt
import json
import os


class ChartAgent(BaseAgent):
    name = "ChartAgent"
    description = "Visualizes data as charts."
    config: AgentConfig = AgentConfig(
        name="chart",
        description="Visualizes data as charts.",
        enabled=True,
        model=None,
        temperature=None,
        max_tokens=None,
    )

    def __init__(self, df: pd.DataFrame):
        """
        Initialize the ChartAgent with a DataFrame.
        Args:
            df (pd.DataFrame): The data to visualize.
        """
        self.df = df
        logger.info(f"[ChartAgent] Initialized with DataFrame shape: {df.shape}")

    def guess_chart(self, query: str) -> str:
        """
        Guess the appropriate chart type based on the user's query.
        Args:
            query (str): The user's natural language query.
        Returns:
            str: The chart type (e.g., 'line', 'bar', 'scatter', etc.).
        """
        logger.info(f"[ChartAgent] guess_chart called with query: {query}")
        query = query.lower()
        if "trend" in query or "over time" in query:
            return "line"
        if "compare" in query or "category" in query:
            return "bar"
        if "distribution" in query:
            return "hist"
        if "correlation" in query or "relationship" in query:
            return "scatter"
        if "proportion" in query or "share" in query:
            return "pie"
        # fallback: never return 'table', default to 'bar'
        return "bar"

    def render_chart(self, x: str, y: str, chart_type: str = "line"):
        """
        Render a chart or return table data based on chart_type.
        For 'table', return columns and records. For others, return Altair chart.
        """
        logger.info(
            f"[ChartAgent] render_chart called with x={x}, y={y}, chart_type={chart_type}"
        )
        if chart_type == "table":
            # Return plain table data for frontend rendering
            records = self.df.to_dict(orient="records")
            columns = list(self.df.columns)
            return {
                "chart_type": "table",
                "columns": columns,
                "data": records
            }
        else:
            # Generate axis labels and title
            x_label = str(x).replace("_", " ").title() if x else "X"
            y_label = str(y).replace("_", " ").title() if y else "Y"
            if chart_type == "line":
                title = f"{y_label} Over {x_label}"
                chart = alt.Chart(self.df, title=title).mark_line().encode(
                    x=alt.X(x, title=x_label),
                    y=alt.Y(y, title=y_label)
                )
            elif chart_type == "bar":
                title = f"{y_label} by {x_label}"
                chart = alt.Chart(self.df, title=title).mark_bar().encode(
                    x=alt.X(x, title=x_label),
                    y=alt.Y(y, title=y_label)
                )
            elif chart_type == "scatter":
                title = f"{y_label} vs {x_label}"
                chart = alt.Chart(self.df, title=title).mark_circle().encode(
                    x=alt.X(x, title=x_label),
                    y=alt.Y(y, title=y_label)
                )
            elif chart_type == "hist":
                title = f"Distribution of {x_label}"
                chart = alt.Chart(self.df, title=title).mark_bar().encode(
                    x=alt.X(x, bin=True, title=x_label),
                    y=alt.Y('count()', title='Count')
                )
            elif chart_type == "pie":
                title = f"{y_label} by {x_label} (Pie Chart)"
                chart = alt.Chart(self.df, title=title).mark_arc().encode(
                    theta=alt.Theta(y, title=y_label),
                    color=alt.Color(x, title=x_label)
                )
            else:
                title = f"{y_label} by {x_label}"
                chart = alt.Chart(self.df, title=title).mark_text().encode(text=x)

            chart_dict = chart.to_dict()
            # Overwrite/inject with data.values for robust parsing:
            try:
                if chart_type == "hist":
                    chart_dict["data"] = {"values": self.df[[x]].to_dict(orient="records")}
                    data_values = self.df[[x]].to_dict(orient="records")
                elif chart_type == "pie":
                    chart_dict["data"] = {"values": self.df[[x, y]].to_dict(orient="records")}
                    data_values = self.df[[x, y]].to_dict(orient="records")
                else:
                    chart_dict["data"] = {"values": self.df[[x, y]].to_dict(orient="records")}
                    data_values = self.df[[x, y]].to_dict(orient="records")
            except Exception as e:
                logger.warning(f"[ChartAgent] Could not extract data_values for chart: {e}")
                chart_dict["data"] = {"values": []}
                data_values = []
            # Add title, x, y to top-level dict for frontend
            return {
                "chart_type": chart_type,
                "x": x,
                "y": y,
                "title": title,
                "x_label": x_label,
                "y_label": y_label,
                "chart": chart_dict,
                "data_values": data_values
            }

    def guess_axes(self) -> Tuple[str, str]:
        """
        Guess the most likely x and y axes for a chart based on column types.
        Returns:
            Tuple[str, str]: The guessed x and y column names.
        """
        logger.info("[ChartAgent] guess_axes called.")
        numeric_cols = self.df.select_dtypes(include=["float", "int"]).columns.tolist()
        non_numeric_cols = self.df.select_dtypes(exclude=["float", "int"]).columns.tolist()

        x = non_numeric_cols[0] if non_numeric_cols else self.df.columns[0]
        y = numeric_cols[0] if numeric_cols else self.df.columns[1]
        return x, y

    def run(self, query: str, data: Any, context=None, **kwargs) -> Dict[str, Any]:
        """
        Execute the agent's logic: parse the query, guess chart type, and generate a chart.
        Args:
            query (str): The user's question.
            data (pd.DataFrame): The data to visualize.
        Returns:
            Dict[str, Any]: Structured output with agent name, role, and result.
        """
        if VERBOSE:
            print(f"[ChartAgent] Running with config: {self.config}")
        logger.info(f"[ChartAgent] run called with query: {query}")
        chart_type = self.guess_chart(query)
        x_axis, y_axis = self.guess_axes()
        chart = self.render_chart(x_axis, y_axis, chart_type)
        result = {
            "agent": self.name,
            "description": self.description,
            "output": chart,
            "config": self.config.__dict__,
        }
        logger.info(f"[ChartAgent] run output: {result}")
        return result

    @staticmethod
    def generate(user_query: str, docs: any, data: any) -> str:
        # TODO: Implement real chart generation logic
        return "[ChartAgent] Chart result (stub)"

    def guess_chart_llm(self, query: str) -> str:
        """
        Use LLM to select the best chart type for the data and query, excluding 'table'.
        Returns one of: line, bar, scatter, histogram, pie
        """
        logger.info(f"[ChartAgent] guess_chart_llm called with query: {query}")
        try:
            profile = {
                "columns": list(self.df.columns),
                "dtypes": self.df.dtypes.astype(str).to_dict(),
                "sample": self.df.head(5).to_dict(orient="records"),
            }
            prompt_template = load_prompt("config/prompts/chart_type_prompt.txt")
            # Remove 'table' from the prompt
            prompt = prompt_template.replace("- table\n", "").replace("table, ", "").replace(", table", "")
            prompt = prompt.format(profile=json.dumps(profile, indent=2), query=query)
            client = get_openai_client()
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=8,
            )
            chart_type = response.choices[0].message.content.strip().lower()
            allowed = {"line", "bar", "scatter", "histogram", "pie"}
            if chart_type in allowed:
                return chart_type
            logger.warning(f"[ChartAgent] LLM returned unexpected chart type: {chart_type}, falling back.")
        except Exception as e:
            logger.error(f"[ChartAgent] guess_chart_llm failed: {e}")
        # fallback: never return 'table', default to 'bar'
        return "bar"
