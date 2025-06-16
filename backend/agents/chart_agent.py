"""
ChartAgent: Generates data visualizations from DataFrame based on user queries.
"""

from backend.agents.base_agent import BaseAgent
import pandas as pd
import altair as alt
from backend.core.logging import logger
from typing import Tuple, Any, Dict, List, Optional, Union
from backend.core.tracing import traced
import json
import os
import time

class ChartAgent(BaseAgent):
    name = "ChartAgent"
    role = "Generates charts and visualizations from data"

    def __init__(self, config=None):
        """
        Initialize ChartAgent with configuration.
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
            data: The DataFrame to visualize
            **kwargs: Additional context
        Returns:
            Dict with preprocessing results
        """
        context = super().pre_process(query, data, **kwargs)
        self.df = data
        logger.info(f"[{self.name}] Pre-processing with DataFrame shape: {data.shape}")
        return context

    @traced(name="chart_agent_execute")
    def _execute(self, query: str, data: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Execute the chart generation based on the query and data.
        
        Args:
            query (str): The user's chart request.
            data (pd.DataFrame): The DataFrame to visualize.
            **kwargs: Additional parameters.
            
        Returns:
            Dict[str, Any]: The chart specification and metadata.
        """
        start_time = time.time()
        try:
            # Determine chart type based on query
            chart_type = self.guess_chart(query)
            logger.info(f"[{self.name}] Guessed chart type: {chart_type} for query: {query}")
            
            # Identify columns for visualization based on data types and query
            x_candidates, y_candidates = self.get_chart_columns(query)
            
            # Select best columns based on candidates
            x = x_candidates[0] if x_candidates else None
            y = y_candidates[0] if y_candidates else None
            
            # Override with any explicit column mentions in query
            x, y = self._extract_columns_from_query(query, x, y)
            
            # Generate chart specification
            if not x:
                return {"error": "Could not identify appropriate columns for visualization",
                        "suggestions": "Try specifying column names in your request"}
                
            # Create chart with determined parameters
            chart_data = {
                "chart_type": chart_type,
                "x": x,
                "y": y,
                "query": query
            }
            
            # Add additional metadata and chart spec
            chart_result = self.render_chart(x, y, chart_type)
            chart_data.update(chart_result)
            
            # Add insights to enhance chart understanding
            chart_data = self.add_chart_insights(chart_data)
            
            # Record metrics
            self._metrics.execution_time = time.time() - start_time
            
            return chart_data
        
        except Exception as e:
            logger.error(f"[{self.name}] Error in _execute: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                "error": f"Failed to generate chart: {str(e)}",
                "chart_type": "error",
                "suggestions": "Try a different visualization or specify columns explicitly"
            }

    def _extract_columns_from_query(self, query: str, default_x: str, default_y: str) -> Tuple[str, str]:
        """
        Extract column names from the query if explicitly mentioned.
        
        Args:
            query (str): The user's query.
            default_x (str): The default x column if none found in query.
            default_y (str): The default y column if none found in query.
            
        Returns:
            Tuple[str, str]: The selected x and y columns.
        """
        x, y = default_x, default_y
        query_lower = query.lower()
        
        # Look for explicit column references
        for col in self.df.columns:
            col_lower = col.lower()
            
            # Check for "x-axis" or "x axis" pattern
            if f"x axis {col_lower}" in query_lower or f"x-axis {col_lower}" in query_lower:
                x = col
                
            # Check for "y-axis" or "y axis" pattern
            if f"y axis {col_lower}" in query_lower or f"y-axis {col_lower}" in query_lower:
                y = col
                
            # Check for "plot column_name" pattern
            if f"plot {col_lower}" in query_lower or f"chart {col_lower}" in query_lower:
                # If we already have an x but no y, use this as y
                if x and not y:
                    y = col
                else:
                    x = col
                    
        return x, y

    def guess_chart(self, query: str) -> str:
        """
        Guess the appropriate chart type based on the user's query.
        Args:
            query (str): The user's natural language query.
        Returns:
            str: The chart type (e.g., 'line', 'bar', 'scatter', etc.).
        """
        logger.info(f"[{self.name}] guess_chart called with query: {query}")
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
        # Explicit chart type requests
        if "line chart" in query:
            return "line"
        if "bar chart" in query or "bar graph" in query:
            return "bar"
        if "scatter plot" in query or "scatterplot" in query:
            return "scatter"
        if "pie chart" in query:
            return "pie"
        if "histogram" in query:
            return "hist"
        if "table" in query:
            return "table"
        # fallback: default to 'bar'
        return "bar"

    def get_chart_columns(self, query: str) -> Tuple[List[str], List[str]]:
        """
        Identify potential x and y columns based on data types and query context.
        
        Args:
            query (str): The user's query.
            
        Returns:
            Tuple[List[str], List[str]]: Lists of potential x and y columns
        """
        # Find date columns as potential x-axis for time series
        date_cols = [col for col in self.df.columns if pd.api.types.is_datetime64_any_dtype(self.df[col])]
        numeric_cols = self.df.select_dtypes(include=["float", "int"]).columns.tolist()
        categorical_cols = self.df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
        
        # For time series, prioritize date columns as x
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
        
        Args:
            chart_data (Dict[str, Any]): Current chart data and metadata.
            
        Returns:
            Dict[str, Any]: Enhanced chart data with insights.
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
            logger.warning(f"[{self.name}] Failed to generate insights: {e}")
            
        chart_data["insights"] = insights
        return chart_data
    
    def _interpret_correlation(self, corr_value: float) -> str:
        """
        Helper method to interpret correlation values.
        
        Args:
            corr_value (float): The correlation coefficient.
            
        Returns:
            str: Textual interpretation of correlation strength.
        """
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

    @traced(name="render_chart")
    def render_chart(self, x: str, y: Optional[str] = None, chart_type: str = "line") -> Dict[str, Any]:
        """
        Render an enhanced chart with better visualizations and insights.
        
        Args:
            x (str): The x-axis column name.
            y (Optional[str]): The y-axis column name (may not be needed for some chart types).
            chart_type (str): The type of chart to render.
            
        Returns:
            Dict[str, Any]: Chart specification and related data.
        """
        logger.info(f"[{self.name}] render_chart called with x={x}, y={y}, chart_type={chart_type}")
        
        try:
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
                
                # Create chart specifications based on requested type
                chart_spec = self._create_chart_spec(x, y, x_label, y_label, chart_type)
                
                # Convert to Altair JSON format for frontend rendering
                if isinstance(chart_spec, alt.Chart):
                    chart_json = chart_spec.to_dict()
                    return {
                        "chart_type": chart_type,
                        "spec": chart_json,
                        "x": x,
                        "y": y,
                        "x_label": x_label,
                        "y_label": y_label
                    }
                else:
                    return chart_spec
                    
        except Exception as e:
            logger.error(f"[{self.name}] Error rendering chart: {str(e)}")
            return {
                "chart_type": "error",
                "error": f"Failed to render chart: {str(e)}",
                "fallback": "table",
                "data": self.df.head(10).to_dict(orient="records")
            }
    
    def _create_chart_spec(self, x: str, y: Optional[str], x_label: str, y_label: str, chart_type: str) -> Union[alt.Chart, Dict]:
        """
        Create an Altair chart specification based on chart type.
        
        Args:
            x (str): The x-axis column.
            y (Optional[str]): The y-axis column.
            x_label (str): Formatted x-axis label.
            y_label (str): Formatted y-axis label.
            chart_type (str): The type of chart to create.
            
        Returns:
            Union[alt.Chart, Dict]: Altair chart object or dictionary with chart data.
        """
        title = f"{y_label} by {x_label}" if y else f"Distribution of {x_label}"
        
        if chart_type == "line":
            # Line chart with points and mean line
            chart = alt.Chart(self.df, title=title).mark_line(point=True).encode(
                x=alt.X(x, title=x_label),
                y=alt.Y(y, title=y_label),
                tooltip=[x, y]
            ).interactive()
            
            # Add mean line for reference
            if y and pd.api.types.is_numeric_dtype(self.df[y]):
                mean_line = alt.Chart(self.df).mark_rule(color='red', strokeDash=[10, 10]).encode(
                    y='mean(' + y + ')',
                    size=alt.value(2)
                )
                chart = chart + mean_line
                
            return chart
            
        elif chart_type == "bar":
            # Bar chart with sort option
            return alt.Chart(self.df, title=title).mark_bar().encode(
                x=alt.X(x, title=x_label, sort='-y'),
                y=alt.Y(y, title=y_label),
                tooltip=[x, y]
            ).interactive()
            
        elif chart_type == "scatter":
            # Scatter plot with trend line
            chart = alt.Chart(self.df, title=title).mark_circle().encode(
                x=alt.X(x, title=x_label),
                y=alt.Y(y, title=y_label),
                tooltip=[x, y]
            ).interactive()
            
            # Add regression line if both columns are numeric
            if (y and pd.api.types.is_numeric_dtype(self.df[x]) and 
                pd.api.types.is_numeric_dtype(self.df[y])):
                regression = chart.transform_regression(x, y).mark_line(color='red')
                chart = chart + regression
                
            return chart
            
        elif chart_type == "hist":
            # Histogram with aggregation
            return alt.Chart(self.df, title=title).mark_bar().encode(
                alt.X(x, bin=True, title=x_label),
                alt.Y('count()', title='Frequency')
            ).interactive()
            
        elif chart_type == "pie":
            # For pie charts, return data for frontend rendering
            if x and y:
                aggregated = self.df.groupby(x)[y].sum().reset_index()
                return {
                    "chart_type": "pie",
                    "labels": aggregated[x].tolist(),
                    "values": aggregated[y].tolist(),
                    "title": title
                }
            else:
                return {"error": "Pie charts require both x (categories) and y (values) columns"}
                
        elif chart_type == "boxplot":
            # Box plot for distribution
            return alt.Chart(self.df, title=title).mark_boxplot().encode(
                x=alt.X(x, title=x_label),
                y=alt.Y(y, title=y_label)
            ).interactive()
            
        elif chart_type == "heatmap":
            # Return data for frontend heatmap rendering
            if x and y:
                pivoted = pd.pivot_table(self.df, values=y, index=self.df[x].astype(str), 
                                         columns=self.df[x].astype(str))
                return {
                    "chart_type": "heatmap",
                    "data": pivoted.to_dict(),
                    "title": title
                }
            else:
                return {"error": "Heatmaps require both x and y columns"}
                
        else:
            # Fallback to bar chart
            return alt.Chart(self.df, title=title).mark_bar().encode(
                x=alt.X(x, title=x_label),
                y=alt.Y(y, title=y_label),
                tooltip=[x, y]
            ).interactive()