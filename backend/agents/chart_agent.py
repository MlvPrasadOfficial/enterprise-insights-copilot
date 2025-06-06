import pandas as pd
import altair as alt
from backend.core.logging import logger
from typing import Tuple


class ChartAgent:
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
        return "table"

    def render_chart(self, x: str, y: str, chart_type: str = "line") -> alt.Chart:
        """
        Render a chart using Altair based on the specified axes and chart type.
        Args:
            x (str): The column for the x-axis.
            y (str): The column for the y-axis.
            chart_type (str): The type of chart to render.
        Returns:
            alt.Chart: The Altair chart object.
        """
        logger.info(
            f"[ChartAgent] render_chart called with x={x}, y={y}, chart_type={chart_type}"
        )
        if chart_type == "line":
            return alt.Chart(self.df).mark_line().encode(x=x, y=y)
        elif chart_type == "bar":
            return alt.Chart(self.df).mark_bar().encode(x=x, y=y)
        elif chart_type == "scatter":
            return alt.Chart(self.df).mark_circle().encode(x=x, y=y)
        elif chart_type == "hist":
            return alt.Chart(self.df).mark_bar().encode(alt.X(x, bin=True), y="count()")
        else:
            return alt.Chart(self.df).mark_text().encode(text=x)

    def guess_axes(self) -> Tuple[str, str]:
        """
        Guess the most likely x and y axes for a chart based on column types.
        Returns:
            Tuple[str, str]: The guessed x and y column names.
        """
        logger.info("[ChartAgent] guess_axes called.")
        numeric_cols = self.df.select_dtypes(include=["float", "int"]).columns.tolist()
        non_numeric_cols = self.df.select_dtypes(
            exclude=["float", "int"]
        ).columns.tolist()

        x = non_numeric_cols[0] if non_numeric_cols else self.df.columns[0]
        y = numeric_cols[0] if numeric_cols else self.df.columns[1]
        return x, y

    @staticmethod
    def generate(user_query: str, docs: any, data: any) -> str:
        """
        Generate a chart for the agentic flow (stub for now).
        Args:
            user_query (str): The user's question.
            docs (Any): Retrieved context (if any).
            data (Any): The data to visualize.
        Returns:
            str: Chart result (stubbed as string).
        """
        # TODO: Implement real chart generation logic
        return "[ChartAgent] Chart result (stub)"


# --- Utility extraction candidates ---
# Consider moving guess_chart, guess_axes, and chart rendering logic to backend/core/utils.py or a new services/chart_utils.py for modularity and reuse.
