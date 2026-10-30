"""
SpecCraft AI - Independent Evaluation Engine
Calculates measurable, reproducible metrics on generated test cases independent of LLMs.
"""

import re
from typing import List, Dict, Any, Set, Tuple
from backend.schemas import (
    TestCase,
    ProjectRequirements,
    EvaluationMetrics,
    CategoryType
)

STANDARD_CATEGORIES: List[str] = ["positive", "negative", "boundary", "validation", "security"]

def normalize_text_for_comparison(text: str) -> str:
    """Normalize text by lowercasing, stripping whitespace and punctuation."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    return " ".join(text.split())

def generate_case_signature(tc: TestCase) -> str:
    """
    Generate normalized hashable signature from title, steps, and expected_result.
    Matching method: Concatenate normalized title, joined steps, and expected result.
    """
    norm_title = normalize_text_for_comparison(tc.title)
    norm_steps = " | ".join(normalize_text_for_comparison(s) for s in (tc.steps or []))
    norm_expected = normalize_text_for_comparison(tc.expected_result)
    return f"{norm_title} ::: {norm_steps} ::: {norm_expected}"

def evaluate_test_cases(
    test_cases: List[TestCase],
    requirements: ProjectRequirements,
    wall_clock_seconds: float = 0.0,
    prompt_tokens: int | None = None,
    completion_tokens: int | None = None,
    total_tokens: int | None = None
) -> EvaluationMetrics:
    """
    Perform rigorous Python-based quantitative evaluation of a test case suite.
    """
    total_cases = len(test_cases)
    predefined_req_ids: Set[str] = {r.id for r in requirements.requirements}
    total_reqs = len(predefined_req_ids)

    # 1. Requirement Coverage
    # Predefined requirements linked to at least one valid test case in requirement_ids
    covered_req_ids: Set[str] = set()
    for tc in test_cases:
        if tc.requirement_ids:
            for req_id in tc.requirement_ids:
                if req_id in predefined_req_ids:
                    covered_req_ids.add(req_id)
                    
    req_coverage_pct = (len(covered_req_ids) / total_reqs * 100.0) if total_reqs > 0 else 0.0

    # 2. Schema Validity & Completeness Check
    # Mandatory fields: test_id, requirement_ids (non-empty list of valid strings),
    # title (non-empty string), category (in STANDARD_CATEGORIES),
    # steps (non-empty list of non-empty strings), expected_result (non-empty string)
    valid_count = 0
    complete_count = 0

    category_counts: Dict[str, int] = {c: 0 for c in STANDARD_CATEGORIES}
    
    for tc in test_cases:
        is_schema_valid = True
        is_complete = True

        # Check title
        if not tc.title or not isinstance(tc.title, str) or len(tc.title.strip()) == 0:
            is_schema_valid = False
            is_complete = False

        # Check requirement_ids
        if not tc.requirement_ids or not isinstance(tc.requirement_ids, list) or len(tc.requirement_ids) == 0:
            is_complete = False
            # Can still be schema valid if optional in base schema, but completeness requires reference

        # Check category
        norm_cat = (tc.category or "").lower().strip()
        if norm_cat not in STANDARD_CATEGORIES:
            is_schema_valid = False
        else:
            category_counts[norm_cat] = category_counts.get(norm_cat, 0) + 1

        # Check steps
        if not tc.steps or not isinstance(tc.steps, list) or len(tc.steps) == 0:
            is_schema_valid = False
            is_complete = False
        else:
            if any(not s or not isinstance(s, str) or len(s.strip()) == 0 for s in tc.steps):
                is_schema_valid = False
                is_complete = False

        # Check expected result
        if not tc.expected_result or not isinstance(tc.expected_result, str) or len(tc.expected_result.strip()) == 0:
            is_schema_valid = False
            is_complete = False

        if is_schema_valid:
            valid_count += 1
        if is_complete:
            complete_count += 1

    schema_validity_pct = (valid_count / total_cases * 100.0) if total_cases > 0 else 0.0
    completeness_pct = (complete_count / total_cases * 100.0) if total_cases > 0 else 0.0

    # 3. Duplicate Rate Detection
    # Using normalized case signatures. Cases with an already seen signature are counted as duplicates.
    seen_signatures: Set[str] = set()
    duplicate_count = 0
    for tc in test_cases:
        sig = generate_case_signature(tc)
        if sig in seen_signatures:
            duplicate_count += 1
        else:
            seen_signatures.add(sig)

    duplicate_rate_pct = (duplicate_count / total_cases * 100.0) if total_cases > 0 else 0.0

    # 4. Category Coverage
    categories_rep = [c for c, cnt in category_counts.items() if cnt > 0]
    missing_cats = [c for c, cnt in category_counts.items() if cnt == 0]

    # 5. Human Review Metrics
    reviewed_count = sum(1 for tc in test_cases if tc.human_review_status != "unreviewed")
    acceptable_count = sum(1 for tc in test_cases if tc.human_review_status == "acceptable")
    needs_imp_count = sum(1 for tc in test_cases if tc.human_review_status == "needs_improvement")
    incorrect_count = sum(1 for tc in test_cases if tc.human_review_status == "incorrect")

    human_acceptance_rate = (
        (acceptable_count / reviewed_count * 100.0) if reviewed_count > 0 else None
    )

    return EvaluationMetrics(
        total_test_cases=total_cases,
        total_requirements=total_reqs,
        covered_requirements=len(covered_req_ids),
        requirement_coverage_pct=round(req_coverage_pct, 1),
        valid_test_cases=valid_count,
        schema_validity_pct=round(schema_validity_pct, 1),
        complete_test_cases=complete_count,
        completeness_pct=round(completeness_pct, 1),
        duplicate_count=duplicate_count,
        duplicate_rate_pct=round(duplicate_rate_pct, 1),
        categories_represented=categories_rep,
        missing_categories=missing_cats,
        category_counts=category_counts,
        generation_time_seconds=round(wall_clock_seconds, 2),
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        reviewed_count=reviewed_count,
        acceptable_count=acceptable_count,
        needs_improvement_count=needs_imp_count,
        incorrect_count=incorrect_count,
        human_acceptance_rate_pct=round(human_acceptance_rate, 1) if human_acceptance_rate is not None else None
    )
