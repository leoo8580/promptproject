"""
Tests for Ollama service integration with mocked network responses:
Verifies handling of reachable status, connection failures, malformed JSON recovery, and parsing.
"""

from unittest.mock import patch, MagicMock
import urllib.error
from backend.ollama_service import OllamaService

def test_ollama_unreachable_handling():
    service = OllamaService(base_url="http://localhost:9999")
    with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("Connection refused")):
        status = service.check_health()
        assert status.reachable is False
        assert "unreachable" in status.message.lower()
        assert status.available_models == []

def test_ollama_reachable_mock():
    service = OllamaService(base_url="http://localhost:11434")
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.read.return_value = b'{"models": [{"name": "qwen2.5:3b"}, {"name": "llama3.2:latest"}]}'
    
    with patch("urllib.request.urlopen", return_value=mock_response):
        status = service.check_health()
        assert status.reachable is True
        assert "qwen2.5:3b" in status.available_models
        assert "llama3.2:latest" in status.available_models

def test_json_parse_and_heuristic_repair():
    service = OllamaService()
    
    # Intentionally malformed JSON with trailing comma and unclosed array/brace
    malformed = """
    {
      "test_cases": [
        {
          "test_id": "TC-999",
          "requirement_ids": ["REQ-001"],
          "title": "Repaired test case",
          "category": "positive",
          "steps": ["Step 1"],
          "expected_result": "Works",
        }
    """
    cases, errors, repair_attempted, repaired = service.parse_and_validate_json(malformed, "strategy_b")
    
    assert repair_attempted is True
    assert len(cases) == 1
    assert cases[0].test_id == "TC-999"
    assert cases[0].title == "Repaired test case"

def test_markdown_codeblock_stripping():
    service = OllamaService()
    raw = """```json
    {
      "test_cases": [
        {
          "test_id": "TC-001",
          "requirement_ids": ["REQ-001"],
          "title": "Clean case",
          "category": "positive",
          "steps": ["Step A"],
          "expected_result": "Success"
        }
      ]
    }
    ```"""
    cases, errors, repair_attempted, _ = service.parse_and_validate_json(raw, "strategy_a")
    assert len(cases) == 1
    assert cases[0].test_id == "TC-001"
