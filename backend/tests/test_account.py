import sys
import os
from unittest.mock import MagicMock, patch
import pytest

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
    app.dependency_overrides.clear()


def test_delete_account_success(client):
    from api.routes.account import get_user_id
    from main import app
    app.dependency_overrides[get_user_id] = lambda: "user-123"

    mock_client = MagicMock()
    mock_client.table.return_value.delete.return_value.eq.return_value.execute.return_value = MagicMock()
    mock_client.auth.admin.delete_user.return_value = MagicMock()

    with patch("api.routes.account.get_client", return_value=mock_client):
        resp = client.delete("/account", headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 204
    mock_client.table.assert_called_once_with("analyses")
    mock_client.auth.admin.delete_user.assert_called_once_with("user-123")


def test_delete_account_analyses_failure_returns_500(client):
    from api.routes.account import get_user_id
    from main import app
    app.dependency_overrides[get_user_id] = lambda: "user-456"

    mock_client = MagicMock()
    mock_client.table.return_value.delete.return_value.eq.return_value.execute.side_effect = Exception("db error")

    with patch("api.routes.account.get_client", return_value=mock_client):
        resp = client.delete("/account", headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 500


def test_delete_account_auth_deletion_failure_returns_500(client):
    from api.routes.account import get_user_id
    from main import app
    app.dependency_overrides[get_user_id] = lambda: "user-789"

    mock_client = MagicMock()
    mock_client.table.return_value.delete.return_value.eq.return_value.execute.return_value = MagicMock()
    mock_client.auth.admin.delete_user.side_effect = Exception("auth error")

    with patch("api.routes.account.get_client", return_value=mock_client):
        resp = client.delete("/account", headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 500
