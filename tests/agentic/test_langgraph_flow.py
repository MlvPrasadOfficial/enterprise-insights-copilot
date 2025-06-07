from backend.agentic.langgraph_flow import run_multiagent_flow

def test_multiagent_flow_basic():
    result = run_multiagent_flow("Analyze Q4 outliers", {})
    assert "plan" in result and "analysis" in result and "debate" in result
    assert isinstance(result["plan"], str)
