"""
End-to-end API tests for FastAPI backend using TestClient.
Covers /health, /ready, and error handling for /index endpoint.
"""

import sys
import os
import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_ready():
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


def test_index_no_file():
    response = client.post("/api/v1/index")
    assert response.status_code == 422  # Missing file
    assert "detail" in response.json()


def test_index_invalid_file():
    # Send a non-CSV file
    data = io.BytesIO(b"not,a,csv\n1,2,3")
    response = client.post(
        "/api/v1/index", files={"file": ("test.txt", data, "text/plain")}
    )
    assert response.status_code in (400, 500)
    assert "detail" in response.json()
