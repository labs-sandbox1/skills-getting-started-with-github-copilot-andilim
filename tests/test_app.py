import pytest
from httpx import AsyncClient
from src.app import app

@pytest.mark.asyncio
async def test_get_activities():
    # Arrange
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Act
        response = await ac.get("/activities")
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

@pytest.mark.asyncio
async def test_signup_and_unregister():
    # Arrange
    test_email = "pytestuser@mergington.edu"
    activity = "Chess Club"
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Act: Sign up
        signup_resp = await ac.post(f"/activities/{activity}/signup?email={test_email}")
        # Assert
        assert signup_resp.status_code in (200, 400)  # 400 if already signed up
        # Act: Unregister
        unregister_resp = await ac.post(f"/activities/{activity}/unregister", json={"email": test_email})
        # Assert
        assert unregister_resp.status_code in (200, 404)  # 404 if not found

@pytest.mark.asyncio
async def test_signup_duplicate():
    # Arrange
    test_email = "michael@mergington.edu"  # Already in Chess Club
    activity = "Chess Club"
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Act
        resp = await ac.post(f"/activities/{activity}/signup?email={test_email}")
    # Assert
    assert resp.status_code == 400
    assert "already signed up" in resp.text
