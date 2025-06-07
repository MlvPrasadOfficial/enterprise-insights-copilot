import pytest
import pandas as pd
from backend.agentic.orchestrator import agentic_flow

def test_agentic_flow_smoke():
    df = pd.DataFrame({"a": [1, 2], "b": [3, 4]})
    result = agentic_flow("Test query", df)
    assert isinstance(result, dict)
    assert "answer" in result
    assert "chart" in result
    assert "critique" in result
