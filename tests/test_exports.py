"""
Tests for CSV and JSON export routines:
Checks RFC 4180 compliance, header stability, newline/quote escaping, and JSON structure.
"""

import csv
import json
import io
from backend.schemas import TestCase
from backend.export import export_test_cases_to_csv, export_test_cases_to_json, CSV_HEADERS

def test_csv_export_escaping_and_headers():
    cases = [
        TestCase(
            test_id="TC-001",
            requirement_ids=["REQ-001", "REQ-002"],
            title='Test with "quotes" and, commas',
            category="positive",
            priority="high",
            preconditions=["Precondition 1"],
            steps=["Line 1\nLine 2", "Step 2"],
            test_data='data: {"key": "val"}',
            expected_result="Passes cleanly",
            assumptions=["Assumption A"],
            human_review_status="acceptable",
            flagged_unsupported_assumptions=False,
            human_notes="Looks great"
        )
    ]
    csv_string = export_test_cases_to_csv(cases, default_strategy="strategy_b")
    
    # Read back with standard csv reader
    reader = csv.reader(io.StringIO(csv_string))
    rows = list(reader)
    
    assert len(rows) == 2  # Header + 1 data row
    assert rows[0] == CSV_HEADERS
    
    data_row = rows[1]
    assert data_row[0] == "TC-001"
    assert data_row[1] == "strategy_b"
    assert data_row[2] == "REQ-001, REQ-002"
    assert data_row[3] == 'Test with "quotes" and, commas'
    assert "Line 1\nLine 2" in data_row[7]
    assert data_row[11] == "acceptable"
    assert data_row[12] == "FALSE"
    assert data_row[13] == "Looks great"

def test_json_export_structure():
    cases = [
        TestCase(
            test_id="TC-101",
            requirement_ids=["REQ-101"],
            title="Json export test",
            category="validation",
            steps=["Step 1"],
            expected_result="Assertion ok"
        )
    ]
    meta = {"experiment_id": "exp-123", "model": "qwen2.5:3b"}
    json_str = export_test_cases_to_json(cases, metadata=meta)
    parsed = json.loads(json_str)
    
    assert parsed["metadata"]["experiment_id"] == "exp-123"
    assert parsed["total_cases"] == 1
    assert parsed["test_cases"][0]["test_id"] == "TC-101"
