import os
import tempfile
import shutil
import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.logging import audit_log

client = TestClient(app)

def test_audit_log_writes_entry(tmp_path):
    log_path = tmp_path / "audit_test.log"
    os.environ["AUDIT_LOG_PATH"] = str(log_path)
    audit_log("test_event", user="testuser", details={"foo": "bar"})
    with open(log_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    assert any("test_event" in line and "testuser" in line for line in lines)


def test_user_upload_endpoint(tmp_path):
    # Simulate a file upload for a user
    test_file = io.BytesIO(b"Reference material content")
    response = client.post(
        "/user-upload",
        files={"file": ("ref.txt", test_file)},
        headers={"X-User-Id": "testuser"},
    )
    assert response.status_code in (200, 201)
    assert "uploaded" in response.text.lower() or "success" in response.text.lower()


def test_api_key_auth_protected():
    # API key is set in env/config; test with and without key
    api_key = os.getenv("API_KEY", "testkey123")
    # Should fail without key
    response = client.post("/secure-agentic", json={"query": "test"})
    assert response.status_code == 403
    # Should succeed with key
    response = client.post(
        "/secure-agentic",
        json={"query": "test"},
        headers={"X-API-Key": api_key},
    )
    assert response.status_code in (200, 201)
