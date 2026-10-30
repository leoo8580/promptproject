"""
Tests for Python-based evaluation metrics:
Requirement coverage, schema validity, completeness, duplicate detection, and category coverage.
"""

from backend.schemas import TestCase, RequirementItem, ProjectRequirements
from backend.evaluation import evaluate_test_cases, generate_case_signature

def build_sample_project() -> ProjectRequirements:
    return ProjectRequirements(
        project_name="Test Project",
        requirements=[
            RequirementItem(id="REQ-001", title="Req 1", description="Description 1"),
            RequirementItem(id="REQ-002", title="Req 2", description="Description 2"),
            RequirementItem(id="REQ-003", title="Req 3", description="Description 3")
        ]
    )

def test_requirement_coverage_calculation():
    proj = build_sample_project()
    # 2 out of 3 requirements covered (REQ-001 and REQ-002)
    cases = [
        TestCase(
            test_id="TC-1",
            requirement_ids=["REQ-001"],
            title="Test 1",
            category="positive",
            steps=["Step 1"],
            expected_result="Success"
        ),
        TestCase(
            test_id="TC-2",
            requirement_ids=["REQ-002"],
            title="Test 2",
            category="negative",
            steps=["Step 1"],
            expected_result="Error"
        ),
        TestCase(
            test_id="TC-3",
            requirement_ids=["REQ-001"],  # repeats REQ-001
            title="Test 3",
            category="boundary",
            steps=["Step 1"],
            expected_result="Edge handled"
        )
    ]
    metrics = evaluate_test_cases(cases, proj, wall_clock_seconds=1.5)
    
    assert metrics.total_test_cases == 3
    assert metrics.total_requirements == 3
    assert metrics.covered_requirements == 2
    assert metrics.requirement_coverage_pct == 66.7
    assert metrics.generation_time_seconds == 1.5

def test_completeness_and_validity():
    proj = build_sample_project()
    cases = [
        # Complete & valid case
        TestCase(
            test_id="TC-1",
            requirement_ids=["REQ-001"],
            title="Complete case",
            category="positive",
            steps=["Step 1", "Step 2"],
            expected_result="Expected outcome"
        ),
        # Incomplete case (empty steps)
        TestCase(
            test_id="TC-2",
            requirement_ids=["REQ-002"],
            title="Incomplete case",
            category="negative",
            steps=[],
            expected_result="Outcome"
        )
    ]
    metrics = evaluate_test_cases(cases, proj)
    assert metrics.valid_test_cases == 1
    assert metrics.complete_test_cases == 1
    assert metrics.schema_validity_pct == 50.0
    assert metrics.completeness_pct == 50.0

def test_duplicate_rate_detection():
    proj = build_sample_project()
    # Create two identical test cases (differing only in test_id)
    cases = [
        TestCase(
            test_id="TC-1",
            requirement_ids=["REQ-001"],
            title="Login with invalid email",
            category="negative",
            steps=["Open page", "Type bad email", "Click send"],
            expected_result="Validation error"
        ),
        TestCase(
            test_id="TC-2",
            requirement_ids=["REQ-001"],
            title="  LOGIN WITH INVALID EMAIL  ",  # normalized duplicate
            category="negative",
            steps=["Open page", "Type bad email", "Click send"],
            expected_result="Validation error."
        ),
        TestCase(
            test_id="TC-3",
            requirement_ids=["REQ-002"],
            title="Distinct test case",
            category="security",
            steps=["Step A"],
            expected_result="Distinct outcome"
        )
    ]
    metrics = evaluate_test_cases(cases, proj)
    assert metrics.total_test_cases == 3
    assert metrics.duplicate_count == 1
    assert metrics.duplicate_rate_pct == 33.3

def test_category_coverage():
    proj = build_sample_project()
    cases = [
        TestCase(
            test_id="TC-1",
            requirement_ids=["REQ-001"],
            title="Positive test",
            category="positive",
            steps=["Step 1"],
            expected_result="OK"
        ),
        TestCase(
            test_id="TC-2",
            requirement_ids=["REQ-002"],
            title="Security test",
            category="security",
            steps=["Step 1"],
            expected_result="Blocked"
        )
    ]
    metrics = evaluate_test_cases(cases, proj)
    assert "positive" in metrics.categories_represented
    assert "security" in metrics.categories_represented
    assert "negative" in metrics.missing_categories
    assert "boundary" in metrics.missing_categories
    assert "validation" in metrics.missing_categories
