"""
Unit tests for backend DataAgent and ChartAgent utility logic.
"""
import sys
import os
import pandas as pd
import pytest
from backend.agents.data_agent import DataAgent
from backend.agents.chart_agent import ChartAgent

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

def test_data_agent_profile():
    df = pd.DataFrame({
        'A': [1, 2, 3, None],
        'B': ['x', 'y', 'z', 'w']
    })
    agent = DataAgent(df)
    profile = agent.profile()
    assert profile['columns'] == ['A', 'B']
    assert profile['shape'] == (4, 2)
    assert 'A' in profile['dtypes']
    assert 'A' in profile['missing_values']

def test_data_agent_summarize_numeric():
    df = pd.DataFrame({'A': [1, 2, 3, 4]})
    agent = DataAgent(df)
    summary = agent.summarize_numeric()
    assert 'A' in summary
    assert 'mean' in summary['A']

def test_data_agent_infer_schema():
    df = pd.DataFrame({'A': [1, 2], 'B': ['x', 'y']})
    agent = DataAgent(df)
    schema = agent.infer_schema()
    assert 'A' in schema and 'B' in schema

def test_chart_agent_guess_chart():
    df = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})
    agent = ChartAgent(df)
    assert agent.guess_chart('trend over time') == 'line'
    assert agent.guess_chart('compare categories') == 'bar'
    assert agent.guess_chart('distribution') == 'hist'
    assert agent.guess_chart('correlation') == 'scatter'
    assert agent.guess_chart('proportion') == 'pie'
    assert agent.guess_chart('random') == 'table'

def test_chart_agent_guess_axes():
    df = pd.DataFrame({'cat': ['a', 'b'], 'val': [1, 2]})
    agent = ChartAgent(df)
    x, y = agent.guess_axes()
    assert x == 'cat' and y == 'val'
