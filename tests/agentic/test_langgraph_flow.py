from backend.agentic.langgraph_flow import run_multiagent_flow

def test_multiagent_flow_basic():
    result = run_multiagent_flow("Analyze Q4 outliers", {})
    assert "status" in result
    assert result["status"] == "success"
    assert "result" in result
    assert isinstance(result["result"], str)

def test_multiagent_flow_chart_routing():
    """Test chart routing in the multi-agent flow."""
    result = run_multiagent_flow("Create a chart showing sales trends")
    assert "status" in result
    assert result["status"] == "success"
    assert "steps" in result
    assert "chart" in result.get("steps", [])

def test_multiagent_flow_sql_routing():
    """Test SQL routing in the multi-agent flow."""
    result = run_multiagent_flow("Run a SQL query to show top products")
    assert "status" in result
    assert result["status"] == "success"
    assert "steps" in result
    assert "sql" in result.get("steps", [])

def test_multiagent_flow_insight_routing():
    """Test insight routing in the multi-agent flow."""
    result = run_multiagent_flow("Give me insights about the sales data")
    assert "status" in result
    assert result["status"] == "success"
    assert "steps" in result
    assert "insight" in result.get("steps", [])
