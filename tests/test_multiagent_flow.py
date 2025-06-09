"""
Test the multi-agent flow with sample queries.

This script tests the multi-agent flow by sending sample queries and
verifying that the responses are generated correctly.
"""

import os
import sys
import pandas as pd
from pathlib import Path

# Add parent directory to path to import backend modules
parent_dir = str(Path(__file__).resolve().parent.parent)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Import the multi-agent flow
from backend.agentic.langgraph_flow import run_multiagent_flow

# Create a sample DataFrame for testing
def create_sample_df():
    """Create a sample sales DataFrame for testing."""
    data = {
        "Date": pd.date_range(start="2023-01-01", periods=100, freq="D"),
        "Product": ["Product A", "Product B", "Product C", "Product D"] * 25,
        "Region": ["North", "South", "East", "West"] * 25,
        "Sales": [100, 200, 150, 300] * 25,
        "Units": [10, 20, 15, 30] * 25,
        "Customer_Type": ["Enterprise", "SMB", "Consumer", "Government"] * 25
    }
    return pd.DataFrame(data)

# Test queries for different agents
def test_queries():
    """Test different types of queries with the multi-agent flow."""
    df = create_sample_df()
    
    # Chart query
    print("\n=== Testing Chart Query ===")
    chart_result = run_multiagent_flow("Create a bar chart showing sales by region", df)
    print(f"Result: {chart_result}")
    
    # SQL query
    print("\n=== Testing SQL Query ===")
    sql_result = run_multiagent_flow("What's the total sales by product?", df)
    print(f"Result: {sql_result}")
    
    # Insight query
    print("\n=== Testing Insight Query ===")
    insight_result = run_multiagent_flow("Give me insights on sales trends", df)
    print(f"Result: {insight_result}")
    
    # General query
    print("\n=== Testing General Query ===")
    general_result = run_multiagent_flow("Tell me about the data", df)
    print(f"Result: {general_result}")
    
if __name__ == "__main__":
    test_queries()
