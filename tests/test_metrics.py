from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_metrics_endpoint():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "anonymous" in data or len(data) > 0
