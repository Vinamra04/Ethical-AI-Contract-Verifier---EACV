import pytest
import sys
import os
from unittest.mock import patch, MagicMock

# Insert backend root into sys.path before any imports so modules resolve correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Set required env vars before config module is imported
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-service-key")
os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")

def make_mock_bundle():
    mock_model = MagicMock()
    mock_model.predict.return_value = [1]
    mock_vec = MagicMock()
    mock_vec.transform.return_value = MagicMock()
    return {"model": mock_model, "vectorizer": mock_vec}

@pytest.fixture
def client():
    with patch("pathlib.Path.exists", return_value=True), \
         patch("builtins.open", MagicMock()), \
         patch("pickle.load", return_value=make_mock_bundle()):
        from main import app
        from fastapi.testclient import TestClient
        yield TestClient(app)

def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
