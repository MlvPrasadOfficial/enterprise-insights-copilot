from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_index_route_without_file():
    response = client.post("/api/v1/index")
    assert response.status_code == 422  # Missing file param


def test_index_with_invalid_file():
    # Upload a non-CSV file (simulate with text)
    response = client.post(
        "/api/v1/index", files={"file": ("test.txt", b"not,a,csv\njust,text\n")}
    )
    # Should return 400 or 500 depending on loader logic
    assert response.status_code in (400, 500)


def test_index_with_empty_file():
    response = client.post("/api/v1/index", files={"file": ("empty.csv", b"")})
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ready_check():
    response = client.get("/ready")
    assert response.status_code == 200


def test_query_without_data():
    response = client.post("/api/v1/query", json={"query": "What is the revenue?"})
    assert response.status_code == 400
    assert "no data uploaded" in response.json()["detail"].lower()


def test_agentic_endpoint():
    response = client.post("/api/v1/agentic", json={"query": "Test agentic"})
    # Should not 500, but may 200 or 400 depending on agent logic
    assert response.status_code in (200, 400, 422)


def test_query_with_invalid_payload():
    # Missing 'query' field
    response = client.post("/api/v1/query", json={"bad": "payload"})
    assert response.status_code == 422


def test_index_too_large_file():
    # Simulate a file >10MB
    big_content = b"a,b\n" + b"1,2\n" * (1024 * 1024)
    response = client.post(
        "/api/v1/index", files={"file": ("big.csv", big_content * 11)}
    )
    assert response.status_code == 413
    assert "too large" in response.json()["detail"].lower()
