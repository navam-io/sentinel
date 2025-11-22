"""
Tests for execution API with assertion validation.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.schema import TestSpec, InputSpec


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


class TestExecutionAPIWithValidation:
    """Tests for execution API with assertion validation."""

    def test_execute_with_all_assertions_passing(self, client):
        """Test execution where all assertions pass."""
        test_spec = {
            "name": "Simple test",
            "model": "gpt-5-nano",
            "inputs": {"query": "What is 2+2?"},
            "assertions": [
                {"must_contain": "4"},
                {"max_latency_ms": 10000},
            ],
        }

        response = client.post("/api/execution/execute", json={"test_spec": test_spec})

        assert response.status_code == 200
        data = response.json()

        assert "result" in data
        assert "assertions" in data
        assert "all_assertions_passed" in data

        # Check execution result
        assert data["result"]["success"] is True
        assert data["result"]["provider"] == "openai"

        # Check assertion validations
        assert len(data["assertions"]) == 2
        assert all(a["passed"] for a in data["assertions"])
        assert data["all_assertions_passed"] is True

    def test_execute_with_some_assertions_failing(self, client):
        """Test execution where some assertions fail."""
        test_spec = {
            "name": "Test with failing assertions",
            "model": "gpt-5-nano",
            "inputs": {"query": "Say hello"},
            "assertions": [
                {"must_contain": "hello"},  # Should pass
                {"must_contain": "impossible_text_xyz123"},  # Should fail
                {"max_latency_ms": 10000},  # Should pass
            ],
        }

        response = client.post("/api/execution/execute", json={"test_spec": test_spec})

        assert response.status_code == 200
        data = response.json()

        # Check that execution succeeded
        assert data["result"]["success"] is True

        # Check that some assertions failed
        assert len(data["assertions"]) == 3
        passed_count = sum(1 for a in data["assertions"] if a["passed"])
        assert passed_count == 2  # Two should pass
        assert data["all_assertions_passed"] is False

    def test_execute_with_tool_call_assertion(self, client):
        """Test execution with tool call assertion."""
        # Note: This test will fail the must_call_tool assertion since
        # we're not actually providing tools to the model
        test_spec = {
            "name": "Tool call test",
            "model": "gpt-5-nano",
            "inputs": {"query": "Search for laptops"},
            "assertions": [
                {"must_call_tool": "browser"},
            ],
        }

        response = client.post("/api/execution/execute", json={"test_spec": test_spec})

        assert response.status_code == 200
        data = response.json()

        # Execution should succeed
        assert data["result"]["success"] is True

        # But tool call assertion should fail (no tools were provided)
        assert len(data["assertions"]) == 1
        assert data["assertions"][0]["assertion_type"] == "must_call_tool"
        assert data["assertions"][0]["passed"] is False

    def test_execute_with_regex_assertion(self, client):
        """Test execution with regex pattern matching."""
        test_spec = {
            "name": "Regex test",
            "model": "gpt-5-nano",
            "inputs": {"query": "Give me a number between 1 and 100"},
            "assertions": [
                {"regex_match": r"\d+"},  # Should match any number
            ],
        }

        response = client.post("/api/execution/execute", json={"test_spec": test_spec})

        assert response.status_code == 200
        data = response.json()

        assert data["result"]["success"] is True
        assert len(data["assertions"]) == 1
        # Should pass since the response likely contains numbers
        assert data["assertions"][0]["assertion_type"] == "regex_match"

    def test_execute_with_token_assertions(self, client):
        """Test execution with token count assertions."""
        test_spec = {
            "name": "Token test",
            "model": "gpt-5-nano",
            "inputs": {"query": "Say hello"},
            "assertions": [
                {"min_tokens": 1},
                {"max_tokens": 1000},
            ],
        }

        response = client.post("/api/execution/execute", json={"test_spec": test_spec})

        assert response.status_code == 200
        data = response.json()

        assert data["result"]["success"] is True
        assert len(data["assertions"]) == 2

        # Both token assertions should pass for a simple "hello" response
        min_tokens_assertion = next(a for a in data["assertions"] if a["assertion_type"] == "min_tokens")
        max_tokens_assertion = next(a for a in data["assertions"] if a["assertion_type"] == "max_tokens")

        assert min_tokens_assertion["passed"] is True
        assert max_tokens_assertion["passed"] is True

    def test_execute_with_minimal_assertions(self, client):
        """Test execution with a single minimal assertion."""
        test_spec = {
            "name": "Minimal assertion test",
            "model": "gpt-5-nano",
            "inputs": {"query": "Hello"},
            "assertions": [
                {"must_not_contain": "error"},  # Simple assertion that should pass
            ],
        }

        response = client.post("/api/execution/execute", json={"test_spec": test_spec})

        assert response.status_code == 200
        data = response.json()

        assert data["result"]["success"] is True
        assert len(data["assertions"]) == 1
        assert data["assertions"][0]["passed"] is True
        assert data["all_assertions_passed"] is True

    def test_execute_with_invalid_assertion_type(self, client):
        """Test execution with unknown assertion type."""
        test_spec = {
            "name": "Invalid assertion test",
            "model": "gpt-5-nano",
            "inputs": {"query": "Hello"},
            "assertions": [
                {"unknown_type": "value"},
            ],
        }

        response = client.post("/api/execution/execute", json={"test_spec": test_spec})

        assert response.status_code == 200
        data = response.json()

        # Execution should succeed
        assert data["result"]["success"] is True

        # But assertion should fail
        assert len(data["assertions"]) == 1
        assert data["assertions"][0]["passed"] is False
        assert "unknown assertion type" in data["assertions"][0]["message"].lower()

    def test_execute_with_output_type_json(self, client):
        """Test execution with JSON output type assertion."""
        test_spec = {
            "name": "JSON output test",
            "model": "gpt-5-nano",
            "inputs": {"query": 'Respond with valid JSON: {"status": "ok"}'},
            "assertions": [
                {"output_type": "json"},
            ],
        }

        response = client.post("/api/execution/execute", json={"test_spec": test_spec})

        assert response.status_code == 200
        data = response.json()

        assert data["result"]["success"] is True
        assert len(data["assertions"]) == 1
        # Note: This may or may not pass depending on if the model returns JSON

    def test_execute_with_multiple_assertion_types(self, client):
        """Test execution with all 8 assertion types."""
        test_spec = {
            "name": "Comprehensive assertion test",
            "model": "gpt-5-nano",
            "inputs": {"query": "Count from 1 to 5"},
            "assertions": [
                {"must_contain": "1"},
                {"must_not_contain": "error"},
                {"regex_match": r"\d+"},
                {"max_latency_ms": 10000},
                {"min_tokens": 1},
                {"max_tokens": 500},
                # Note: output_type and must_call_tool are harder to test without specific setup
            ],
        }

        response = client.post("/api/execution/execute", json={"test_spec": test_spec})

        assert response.status_code == 200
        data = response.json()

        assert data["result"]["success"] is True
        assert len(data["assertions"]) >= 6

        # Most assertions should pass
        passed_count = sum(1 for a in data["assertions"] if a["passed"])
        assert passed_count >= 5  # At least 5 should pass

    def test_execute_status_endpoint(self, client):
        """Test the status endpoint."""
        response = client.get("/api/execution/status")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "ready"
        assert "message" in data
