from backend.agents.base_agent import BaseAgent
import pandas as pd
import altair as alt
from backend.core.logging import logger
from typing import Tuple, Any, Dict, List, Optional
from config.agent_config import AgentConfig
from config.constants import VERBOSE
from backend.core.models import get_openai_client
from config.settings import load_prompt
import json
import os


class ChartAgent(BaseAgent):
    def __init__(self, df=None):
        self.df = df
        self.name = "ChartAgent"
        self.description = "Generates charts and visualizations from data"

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
        if "proportion" in query or "share" in query or "percentage" in query:
            return "pie"
        if "area" in query or "cumulative" in query:
            return "area"
        if "box" in query or "quartile" in query or "range" in query:
            return "boxplot"
        if "heat" in query or "matrix" in query:
            return "heatmap"
        # fallback: never return 'table', default to 'bar'
        return "bar"

    def get_chart_columns(self, query: str) -> Tuple[List[str], List[str]]:
        """
        Identify potential x and y columns based on data types and query context.
        
        Returns:
            Tuple[List[str], List[str]]: Lists of potential x and y columns
        """
        date_cols = [col for col in self.df.columns if pd.api.types.is_datetime64_any_dtype(self.df[col])]
        numeric_cols = self.df.select_dtypes(include=["float", "int"]).columns.tolist()
        categorical_cols = self.df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
        
        x_candidates = date_cols + categorical_cols
        y_candidates = numeric_cols
        
        if not x_candidates:
            x_candidates = self.df.columns.tolist()
        if not y_candidates:
            y_candidates = self.df.columns.tolist()
            
        # Try to prioritize columns that match words in the query
        query_words = set(query.lower().split())
        
        def score_column(col):
            col_name = col.lower().replace('_', ' ')
            return sum(1 for word in query_words if word in col_name)
        
        x_candidates = sorted(x_candidates, key=score_column, reverse=True)
        y_candidates = sorted(y_candidates, key=score_column, reverse=True)
        
        return x_candidates, y_candidates

    def add_chart_insights(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add statistical insights and annotations to enhance chart understanding.
        """
        chart_type = chart_data.get("chart_type")
        x = chart_data.get("x")
        y = chart_data.get("y")
        insights = {}
        
        try:
            if chart_type in ["line", "bar", "scatter"] and x and y and y in self.df.columns:
                # Add basic statistics
                insights["statistics"] = {
                    "mean": float(self.df[y].mean()),
                    "median": float(self.df[y].median()),
                    "min": float(self.df[y].min()),
                    "max": float(self.df[y].max())
                }
                
                # Add trend information for line charts
                if chart_type == "line" and len(self.df) > 1:
                    first_val = float(self.df[y].iloc[0])
                    last_val = float(self.df[y].iloc[-1])
                    change = last_val - first_val
                    pct_change = (change / first_val * 100) if first_val != 0 else float('inf')
                    
                    insights["trend"] = {
                        "direction": "up" if change > 0 else "down" if change < 0 else "flat",
                        "change": change,
                        "percent_change": pct_change
                    }
                
                # Add correlation for scatter plots
                if chart_type == "scatter" and x in self.df.columns:
                    if pd.api.types.is_numeric_dtype(self.df[x]) and pd.api.types.is_numeric_dtype(self.df[y]):
                        corr = self.df[x].corr(self.df[y])
                        insights["correlation"] = float(corr)
                        insights["interpretation"] = self._interpret_correlation(corr)
            
            # Add distribution insights for histograms
            elif chart_type == "hist" and x in self.df.columns:
                if pd.api.types.is_numeric_dtype(self.df[x]):
                    insights["distribution"] = {
                        "skewness": float(self.df[x].skew()),
                        "kurtosis": float(self.df[x].kurtosis()),
                        "q1": float(self.df[x].quantile(0.25)),
                        "q3": float(self.df[x].quantile(0.75))
                    }
            
            # Add proportion insights for pie charts
            elif chart_type == "pie" and x in self.df.columns and y in self.df.columns:
                total = self.df[y].sum()
                top_categories = self.df.groupby(x)[y].sum().sort_values(ascending=False)
                top_3 = top_categories.head(3)
                
                insights["proportions"] = {
                    "top_categories": [
                        {"name": str(cat), "value": float(val), "percentage": float(val/total*100)}
                        for cat, val in top_3.items()
                    ]
                }
        
        except Exception as e:
            logger.warning(f"[ChartAgent] Failed to generate insights: {e}")
            
        chart_data["insights"] = insights
        return chart_data
    
    def _interpret_correlation(self, corr_value: float) -> str:
        """Helper method to interpret correlation values"""
        abs_corr = abs(corr_value)
        if abs_corr < 0.1:
            return "No correlation"
        elif abs_corr < 0.3:
            return "Weak correlation"
        elif abs_corr < 0.5:
            return "Moderate correlation"
        elif abs_corr < 0.7:
            return "Strong correlation"
        else:
            return "Very strong correlation"

    def render_chart(self, x: str, y: Optional[str] = None, chart_type: str = "line"):
        """
        Render an enhanced chart with better visualizations and insights.
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
                chart = alt.Chart(self.df, title=title).mark_line(point=True).encode(
                    x=alt.X(x, title=x_label),
                    y=alt.Y(y, title=y_label),
                    tooltip=[x, y]
                ).interactive()
                
                # Add mean line for reference
                mean_line = alt.Chart(self.df).mark_rule(color='red', strokeDash=[10, 10]).encode(
                    y='mean(' + y + ')',
                    size=alt.value(2)
                )
                chart = chart + mean_line

            elif chart_type == "bar":
                title = f"{y_label} by {x_label}"
                chart = alt.Chart(self.df, title=title).mark_bar().encode(
                    x=alt.X(x, title=x_label, sort='-y'),
                    y=alt.Y(y, title=y_label),
                    tooltip=[x, y],
                    color=alt.Color(x, legend=None)
                ).interactive()

            elif chart_type == "scatter":
                title = f"{y_label} vs {x_label}"
                # Add trendline to scatter plot
                chart = alt.Chart(self.df, title=title).mark_circle(size=60).encode(
                    x=alt.X(x, title=x_label),
                    y=alt.Y(y, title=y_label),
                    tooltip=[x, y]
                ).interactive()
                
                # Add regression line if both columns are numeric
                if pd.api.types.is_numeric_dtype(self.df[x]) and pd.api.types.is_numeric_dtype(self.df[y]):
                    regression = chart.transform_regression(x, y).mark_line(color='red')
                    chart = chart + regression

            elif chart_type == "hist":
                title = f"Distribution of {x_label}"
                chart = alt.Chart(self.df, title=title).mark_bar().encode(
                    x=alt.X(x, bin=alt.Bin(maxbins=20), title=x_label),
                    y=alt.Y('count()', title='Frequency'),
                    tooltip=['count()']
                ).interactive()

            elif chart_type == "pie":
                # Create a better pie chart with labels
                title = f"{y_label} by {x_label}"
                
                # Aggregate the data first
                pie_data = self.df.groupby(x)[y].sum().reset_index()
                
                chart = alt.Chart(pie_data, title=title).mark_arc().encode(
                    theta=alt.Theta(y, title=y_label),
                    color=alt.Color(x, title=x_label),
                    tooltip=[x, y]
                ).properties(
                    width=400,
                    height=400
                )

            elif chart_type == "area":
                title = f"{y_label} Over {x_label}"
                chart = alt.Chart(self.df, title=title).mark_area(opacity=0.7).encode(
                    x=alt.X(x, title=x_label),
                    y=alt.Y(y, title=y_label),
                    tooltip=[x, y]
                ).interactive()
                
            elif chart_type == "boxplot":
                title = f"Distribution of {y_label} by {x_label}"
                chart = alt.Chart(self.df, title=title).mark_boxplot().encode(
                    x=alt.X(x, title=x_label),
                    y=alt.Y(y, title=y_label)
                ).interactive()
                
            elif chart_type == "heatmap":
                # Create a heatmap if we have two categorical columns and a numeric column
                # If y is not provided, try to use a count
                title = f"Heatmap of {x_label} and {y_label}"
                
                if y and pd.api.types.is_numeric_dtype(self.df[y]):
                    # Find another categorical column
                    categorical_cols = self.df.select_dtypes(include=["object", "category"]).columns.tolist()
                    if len(categorical_cols) >= 2 and x in categorical_cols:
                        other_col = next((c for c in categorical_cols if c != x), None)
                        if other_col:
                            pivot_data = self.df.pivot_table(
                                index=x, 
                                columns=other_col, 
                                values=y, 
                                aggfunc='mean'
                            ).reset_index().melt(id_vars=[x])
                            
                            chart = alt.Chart(pivot_data, title=title).mark_rect().encode(
                                x=alt.X(x, title=x_label),
                                y=alt.Y('variable', title=other_col.replace('_', ' ').title()),
                                color=alt.Color('value', title=y_label),
                                tooltip=[x, 'variable', 'value']
                            ).interactive()
                        else:
                            # Fallback to bar
                            return self.render_chart(x, y, "bar")
                    else:
                        # Fallback to bar
                        return self.render_chart(x, y, "bar")
                else:
                    # Fallback to bar
                    return self.render_chart(x, y, "bar")
            else:
                title = f"{y_label} by {x_label}"
                chart = alt.Chart(self.df, title=title).mark_bar().encode(
                    x=alt.X(x, title=x_label),
                    y=alt.Y(y, title=y_label)
                ).interactive()

            chart_dict = chart.to_dict()
            
            # Prepare data values for the chart
            try:
                if chart_type == "hist":
                    data_values = self.df[[x]].to_dict(orient="records")
                    chart_dict["data"] = {"values": data_values}
                elif chart_type == "pie":
                    data_values = pie_data.to_dict(orient="records") if 'pie_data' in locals() else self.df[[x, y]].to_dict(orient="records")
                    chart_dict["data"] = {"values": data_values}
                elif chart_type == "heatmap" and 'pivot_data' in locals():
                    data_values = pivot_data.to_dict(orient="records")
                    chart_dict["data"] = {"values": data_values}
                else:
                    data_values = self.df[[x, y]].to_dict(orient="records")
                    chart_dict["data"] = {"values": data_values}
            except Exception as e:
                logger.warning(f"[ChartAgent] Could not extract data_values for chart: {e}")
                chart_dict["data"] = {"values": []}
                data_values = []
                
            # Build result with enhanced metadata
            result = {
                "chart_type": chart_type,
                "x": x,
                "y": y,
                "title": title,
                "x_label": x_label,
                "y_label": y_label,
                "chart": chart_dict,
                "data_values": data_values
            }
              # Add insights to the chart data
            return self.add_chart_insights(result)
            
    def guess_axes(self, query: str = "") -> Tuple[str, str]:
        """
        Guess the most likely x and y axes for a chart based on column types and query.
        
        Args:
            query (str): User query to help identify relevant columns
            
        Returns:
            Tuple[str, str]: The guessed x and y column names.
        """
        logger.info(f"[ChartAgent] guess_axes called with query: {query}")
        
        # Safety check for empty DataFrame
        if self.df is None or len(self.df.columns) == 0:
            logger.warning("[ChartAgent] DataFrame is empty or None in guess_axes")
            return ("x", "y")  # Return dummy values if no data available
            
        # If query is None, set it to an empty string to avoid TypeError
        if query is None:
            query = ""
            
        x_candidates, y_candidates = self.get_chart_columns(query)
        
        # Safe access to columns with proper error handling
        try:
            x = x_candidates[0] if x_candidates else self.df.columns[0]
            y = y_candidates[0] if y_candidates else (self.df.columns[1] if len(self.df.columns) > 1 else self.df.columns[0])
        except (IndexError, AttributeError) as e:
            logger.error(f"[ChartAgent] Error selecting columns in guess_axes: {str(e)}")
            # Return safe default values if column access fails
            columns = list(self.df.columns)
            x = columns[0] if columns else "x"
            y = columns[1] if len(columns) > 1 else columns[0] if columns else "y"
            
        logger.info(f"[ChartAgent] Selected axes: x={x}, y={y}")
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
        
        # Use LLM for better chart selection if possible, fallback to rule-based
        try:
            chart_type = self.guess_chart_llm(query)
        except Exception as e:
            logger.warning(f"[ChartAgent] LLM chart selection failed, falling back to rule-based: {e}")
            chart_type = self.guess_chart(query)
            
        x_axis, y_axis = self.guess_axes(query)
        chart = self.render_chart(x_axis, y_axis, chart_type)
        result = {
            "agent": self.name,
            "description": self.description,
            "output": chart,
            "config": self.config.__dict__,
        }
        logger.info(f"[ChartAgent] run output: {result}")
        return result
    
    # ...existing code...