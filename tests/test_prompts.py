"""
Tests for prompt engineering templates:
Verifies structural differences between Strategy A, B, and C, ensuring
unsupported assumptions and categories are handled.
"""

from backend.schemas import ProjectRequirements, RequirementItem
from backend.prompts import (
    build_strategy_a_prompt,
    build_strategy_b_prompt,
    build_strategy_c_prompt,
    get_prompt_for_strategy
)

def build_test_project():
    return ProjectRequirements(
        project_name="E-Commerce Payment",
        requirements=[
            RequirementItem(
                id="REQ-001",
                title="Credit card payment",
                description="Process Visa and Mastercard payments."
            ),
            RequirementItem(
                id="REQ-002",
                title="Fraud detection policy",
                description="Trigger fraud review according to policy.",
                is_unresolved=True,
                unresolved_note="Threshold score is unconfigured."
            )
        ]
    )

def test_prompt_structural_differences():
    proj = build_test_project()
    prompt_a = build_strategy_a_prompt(proj)
    prompt_b = build_strategy_b_prompt(proj)
    prompt_c = build_strategy_c_prompt(proj)

    # Strategy A is concise
    assert len(prompt_a) < len(prompt_b)
    assert len(prompt_b) < len(prompt_c)

    # Strategy B introduces role, categories, and anti-hallucination rule
    assert "Principal Software Quality Assurance Engineer" in prompt_b
    assert "ANTI-HALLUCINATION & ASSUMPTION DISCIPLINE" in prompt_b
    assert "positive" in prompt_b
    assert "boundary" in prompt_b
    assert "security" in prompt_b

    # Strategy C contains few-shot examples
    assert "EXAMPLE 1" in prompt_c
    assert "EXAMPLE 2" in prompt_c
    assert "TC-EX01" in prompt_c
    assert "TC-EX02" in prompt_c

def test_unresolved_flag_inclusion():
    proj = build_test_project()
    prompt_b = build_strategy_b_prompt(proj)
    assert "[FLAGGED UNRESOLVED: Needs user clarification]" in prompt_b
    assert "Threshold score is unconfigured" in prompt_b
