import os
os.environ["DATABASE_URL"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db import Base, get_db
from app.main import app

@pytest.fixture()
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    sessions = sessionmaker(bind=engine)
    def test_db():
        with sessions() as db:
            yield db
    app.dependency_overrides[get_db] = test_db
    with TestClient(app) as api:
        yield api
    app.dependency_overrides.clear()
    engine.dispose()

def task(client):
    response = client.post("/api/tasks", json={"title": "Complete Ingress lab", "assignee": "Vedanshu", "priority": "HIGH"})
    assert response.status_code == 201
    return response.json()

def test_health(client):
    assert client.get("/health").json() == {"status": "UP"}

def test_root(client):
    assert client.get("/").json()["service"] == "LabBoard API"

def test_ready(client):
    assert client.get("/ready").json() == {"status": "READY"}

def test_create_and_list(client):
    created = task(client)
    assert client.get("/api/tasks").json()[0]["id"] == created["id"]

def test_get_task(client):
    created = task(client)
    assert client.get(f"/api/tasks/{created['id']}").json()["title"] == created["title"]

def test_update_and_statistics(client):
    created = task(client)
    assert client.put(f"/api/tasks/{created['id']}", json={"status": "DONE"}).json()["status"] == "DONE"
    assert client.get("/api/tasks/stats").json() == {"total": 1, "todo": 0, "inProgress": 0, "done": 1}

def test_delete(client):
    created = task(client)
    assert client.delete(f"/api/tasks/{created['id']}").status_code == 204
    assert client.get(f"/api/tasks/{created['id']}").status_code == 404

def test_reject_invalid_task(client):
    assert client.post("/api/tasks", json={"title": "", "status": "INVALID"}).status_code == 422

def test_missing_task(client):
    assert client.get("/api/tasks/999999").status_code == 404

def test_metrics(client):
    client.get("/health")
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text
