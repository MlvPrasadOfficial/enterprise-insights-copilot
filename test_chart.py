import pandas as pd
import sys
from backend.agents.chart_agent import ChartAgent

# Create a simple test DataFrame
df = pd.DataFrame({
    'date': pd.date_range(start='2023-01-01', periods=10),
    'sales': [100, 200, 150, 300, 250, 400, 350, 500, 450, 600],
    'region': ['North', 'South', 'East', 'West', 'North', 'South', 'East', 'West', 'North', 'South']
})

# Test with a real DataFrame
agent = ChartAgent(df)
print("Test with query 'Show me sales over time':")
x, y = agent.guess_axes('Show me sales over time')
print(f"x={x}, y={y}")

print("\nTest with None query:")
x, y = agent.guess_axes(None)
print(f"x={x}, y={y}")

# Test with an empty DataFrame
print("\nTest with empty DataFrame:")
empty_df = pd.DataFrame()
empty_agent = ChartAgent(empty_df)
try:
    x, y = empty_agent.guess_axes('Show me data')
    print(f"x={x}, y={y}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
