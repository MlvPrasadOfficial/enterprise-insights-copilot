import io
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_knowledge_base_upload():
    # Simulate a user uploading a knowledge base file
    file_content = b"Sample knowledge base text."
    response = client.post(
        "/user-upload",
        files={"file": ("kb.txt", file_content)},
        headers={"X-User-Id": "testuser"},
    )
    assert response.status_code in (200, 201)
    assert "uploaded" in response.text.lower() or "success" in response.text.lower()
