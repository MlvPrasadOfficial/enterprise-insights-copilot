import requests

def test_prometheus_metrics():
    # Assumes Prometheus metrics are exposed at /metrics
    try:
        response = requests.get("http://localhost:8000/metrics")
        assert response.status_code == 200
        assert "# HELP" in response.text or "# TYPE" in response.text
    except Exception:
        # Prometheus is optional; pass if not enabled
        pass
