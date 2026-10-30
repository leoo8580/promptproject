"""
Tests for test-case schema validation with Pydantic.
Verifies valid schemas, missing mandatory fields, and category normalization.
"""

import pytest
from pydantic import ValidationError
from backend.schemas import TestCase, RequirementItem, ProjectRequirements

def test_valid_test_case_creation():
    tc = TestCase(
        test_id="TC-001",
        requirement_ids=["REQ-001"],
        title="Valid credential login test",
        category="positive",
        priority="high",
        preconditions=["User account created"],
        steps=["Open login", "Fill email", "Click submit"],
        test_data="user@example.com / secret",
        expected_result="User is logged in successfully",
        assumptions=[]
    )
    assert tc.test_id == "TC-001"
    assert tc.category == "positive"
    assert tc.priority == "high"
    assert len(tc.steps) == 3

def test_category_normalization():
    tc = TestCase(
        test_id="TC-002",
        requirement_ids=["REQ-002"],
        title="Check boundary behavior",
        category="  Boundary  ",
        steps=["Step 1"],
        expected_result="Assert edge handled"
    )
    assert tc.category == "boundary"

def test_missing_mandatory_fields():
    with pytest.raises(ValidationError):
        # Missing required steps and expected_result
        TestCase(
            test_id="TC-003",
            requirement_ids=["REQ-001"],
            title="Incomplete test case",
            category="positive"
        )

def test_project_requirements_schema():
    req = RequirementItem(
        id="REQ-005",
        title="Lockout policy",
        description="Enforce security policy on failure",
        is_unresolved=True,
        unresolved_note="Threshold not specified"
    )
    proj = ProjectRequirements(
        project_name="Auth Service",
        requirements=[req],
        system_assumptions=["HTTPS only"]
    )
    assert proj.project_name == "Auth Service"
    assert proj.requirements[0].is_unresolved is True
