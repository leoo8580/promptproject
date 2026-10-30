"""
SpecCraft AI - Export Service
Generates RFC 4180 compliant CSV and structured JSON exports for test cases and evaluation metrics.
"""

import io
import csv
import json
from typing import List, Dict, Any, Optional
from backend.schemas import TestCase, StrategyRunResult, ExperimentRecord

CSV_HEADERS = [
    "test_id",
    "strategy_id",
    "requirement_ids",
    "title",
    "category",
    "priority",
    "preconditions",
    "steps",
    "test_data",
    "expected_result",
    "assumptions",
    "human_review_status",
    "flagged_unsupported_assumptions",
    "human_notes"
]

def export_test_cases_to_csv(cases: List[TestCase], default_strategy: str = "") -> str:
    """
    Export a list of test cases to RFC 4180 compliant CSV format.
    Ensures safe escaping for newlines, commas, and double quotes.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL, lineterminator="\r\n")
    
    # Write stable headers
    writer.writerow(CSV_HEADERS)
    
    for tc in cases:
        strat = tc.strategy_id or default_strategy
        req_ids = ", ".join(tc.requirement_ids) if tc.requirement_ids else ""
        preconds = " | ".join(tc.preconditions) if tc.preconditions else ""
        steps_text = " -> ".join(tc.steps) if tc.steps else ""
        assump = " | ".join(tc.assumptions) if tc.assumptions else ""
        
        row = [
            tc.test_id,
            strat,
            req_ids,
            tc.title,
            tc.category,
            tc.priority,
            preconds,
            steps_text,
            tc.test_data or "",
            tc.expected_result,
            assump,
            tc.human_review_status,
            "TRUE" if tc.flagged_unsupported_assumptions else "FALSE",
            tc.human_notes or ""
        ]
        writer.writerow(row)
        
    return output.getvalue()

def export_test_cases_to_json(
    cases: List[TestCase],
    metadata: Optional[Dict[str, Any]] = None
) -> str:
    """Export test cases with metadata to formatted JSON string."""
    payload = {
        "metadata": metadata or {},
        "total_cases": len(cases),
        "test_cases": [tc.model_dump() for tc in cases]
    }
    return json.dumps(payload, indent=2)

def export_experiment_comparison_csv(experiment: ExperimentRecord) -> str:
    """Export benchmark comparison metrics across strategies to CSV."""
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL, lineterminator="\r\n")
    
    headers = [
        "Strategy ID",
        "Strategy Name",
        "Total Test Cases",
        "Covered Requirements",
        "Requirement Coverage %",
        "Valid Cases",
        "Schema Validity %",
        "Complete Cases",
        "Completeness %",
        "Duplicates",
        "Duplicate Rate %",
        "Categories Represented",
        "Missing Categories",
        "Generation Time (s)",
        "Prompt Tokens",
        "Completion Tokens",
        "Total Tokens",
        "Human Reviewed",
        "Human Acceptance %"
    ]
    writer.writerow(headers)
    
    for strat_id, strat_res in experiment.strategy_results.items():
        m = strat_res.metrics
        row = [
            strat_id,
            strat_res.strategy_name,
            m.total_test_cases,
            f"{m.covered_requirements}/{m.total_requirements}",
            f"{m.requirement_coverage_pct:.1f}%",
            m.valid_test_cases,
            f"{m.schema_validity_pct:.1f}%",
            m.complete_test_cases,
            f"{m.completeness_pct:.1f}%",
            m.duplicate_count,
            f"{m.duplicate_rate_pct:.1f}%",
            ", ".join(m.categories_represented),
            ", ".join(m.missing_categories),
            f"{m.generation_time_seconds:.2f}",
            m.prompt_tokens if m.prompt_tokens is not None else "Not available",
            m.completion_tokens if m.completion_tokens is not None else "Not available",
            m.total_tokens if m.total_tokens is not None else "Not available",
            m.reviewed_count,
            f"{m.human_acceptance_rate_pct:.1f}%" if m.human_acceptance_rate_pct is not None else "Not reviewed"
        ]
        writer.writerow(row)
        
    return output.getvalue()
