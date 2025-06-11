"""
Test script to verify that the ChartAgent.guess_axes() method works properly with query parameter.
"""
import sys
import os
import pandas as pd
import traceback

# Add parent directory to path so we can import modules
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from backend.agents.chart_agent import ChartAgent
from backend.core.logging import logger

def test_guess_axes_with_query():
    """Test that ChartAgent.guess_axes() properly handles the query parameter."""
    # Create a simple test DataFrame
    df = pd.DataFrame({
        'date': pd.date_range(start='2023-01-01', periods=10),
        'sales': [100, 200, 150, 300, 250, 400, 350, 500, 450, 600],
        'region': ['North', 'South', 'East', 'West', 'North', 'South', 'East', 'West', 'North', 'South']
    })
    
    # Create ChartAgent instance
    agent = ChartAgent(df)
    
    # Test with various queries
    queries = [
        "Show me sales over time",
        "Compare sales by region",
        "What's the trend in sales?",
        None,  # Test with None
        ""     # Test with empty string
    ]
      print("Testing ChartAgent.guess_axes() with different queries:")
    print("=====================================================")
    for query in queries:
        try:
            x, y = agent.guess_axes(query)
            sys.stderr.write(f"Query: '{query}'\n")
            sys.stderr.write(f"Result: x={x}, y={y}\n")
            sys.stderr.write("-----------------------------------------------------\n")
        except Exception as e:
            sys.stderr.write(f"Query: '{query}'\n")            sys.stderr.write(f"Error: {str(e)}\n")
            sys.stderr.write(traceback.format_exc())
            sys.stderr.write("-----------------------------------------------------\n")
    
    # Test with empty DataFrame
    try:
        empty_df = pd.DataFrame()
        empty_agent = ChartAgent(empty_df)
        x, y = empty_agent.guess_axes("Show me the data")
        sys.stderr.write("Empty DataFrame test:\n")
        sys.stderr.write(f"Result: x={x}, y={y}\n")
        sys.stderr.write("-----------------------------------------------------\n")
    except Exception as e:
        sys.stderr.write("Empty DataFrame test:\n")
        sys.stderr.write(f"Error: {str(e)}\n")
        sys.stderr.write(traceback.format_exc())
        sys.stderr.write("-----------------------------------------------------\n")
    
    return True

if __name__ == "__main__":
    test_guess_axes_with_query()
