"""
SpecCraft AI - Prompt Engineering Laboratory Templates
Contains Strategy A (Basic), Strategy B (Structured), and Strategy C (Few-Shot).
Kept modular and versioned for empirical comparison.
"""

from typing import List
from backend.schemas import ProjectRequirements

PROMPT_VERSION = "v1.2.0"

def format_requirements_block(proj: ProjectRequirements) -> str:
    """Format the user-provided requirements and acceptance criteria."""
    lines = [f"Project: {proj.project_name}"]
    if proj.system_assumptions:
        lines.append("Stated System Assumptions:")
        for a in proj.system_assumptions:
            lines.append(f"- {a}")
    
    lines.append("\nRequirements:")
    for r in proj.requirements:
        unres = " [FLAGGED UNRESOLVED: Needs user clarification]" if r.is_unresolved else ""
        lines.append(f"- {r.id}: {r.title}{unres}")
        lines.append(f"  Description: {r.description}")
        if r.acceptance_criteria:
            lines.append("  Acceptance Criteria:")
            for ac in r.acceptance_criteria:
                lines.append(f"    * {ac}")
        if r.is_unresolved and r.unresolved_note:
            lines.append(f"    * Note on Unresolved Behavior: {r.unresolved_note}")
    
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# STRATEGY A: BASIC PROMPTING
# Concise, unstructured prompt with minimal constraints.
# ---------------------------------------------------------------------------
def build_strategy_a_prompt(proj: ProjectRequirements) -> str:
    reqs_text = format_requirements_block(proj)
    return f"""You are a QA engineer. Generate test cases for the following software requirements.
Output your test cases in JSON format containing a "test_cases" list.

{reqs_text}

Provide test cases with test_id, requirement_ids, title, category, steps, and expected_result.
Return ONLY valid JSON.
"""


# ---------------------------------------------------------------------------
# STRATEGY B: STRUCTURED PROMPTING
# Explicit role, task constraints, schema specification, required categories,
# boundary conditions, and strict prohibition against inventing assumptions.
# ---------------------------------------------------------------------------
def build_strategy_b_prompt(proj: ProjectRequirements) -> str:
    reqs_text = format_requirements_block(proj)
    return f"""You are a Principal Software Quality Assurance Engineer and Test Architect.

### TASK
Generate a comprehensive, rigorous suite of software test cases derived strictly from the specification provided below.

### SPECIFICATION
{reqs_text}

### COVERAGE REQUIREMENTS & RULES
1. EVERY requirement ID (e.g., REQ-001) must have at least one dedicated test case explicitly linking to it in "requirement_ids".
2. You must systematically cover these test categories:
   - "positive": Happy path verifying nominal specifications.
   - "negative": Invalid inputs, format violations, authentication failures.
   - "boundary": Extremes, limits, boundary thresholds (e.g. max length, edge counts).
   - "validation": Field requirements, data type, empty values, regex checks.
   - "security": Injection, credential safety, lockout adherence, unauthorized access.
3. ANTI-HALLUCINATION & ASSUMPTION DISCIPLINE:
   - NEVER invent business rules or thresholds that are not specified (e.g. if a lockout policy threshold is not stated, do not invent "3 attempts").
   - If an assumption is required to make a test case actionable, you MUST explicitly document it inside the "assumptions" array.
   - Label predictions as predictions in "expected_result".
4. MANDATORY JSON OUTPUT SCHEMA:
   Return ONLY a valid JSON object matching this exact structure:
{{
  "test_cases": [
    {{
      "test_id": "TC-001",
      "requirement_ids": ["REQ-001"],
      "title": "Clear concise test title",
      "category": "positive",
      "priority": "high",
      "preconditions": ["List of initial setup conditions"],
      "steps": ["Step 1", "Step 2", "Step 3"],
      "test_data": "Specific concrete test payload or inputs",
      "expected_result": "Exact verifiable assertion of system outcome",
      "assumptions": ["Explicit stated assumption or leave empty"]
    }}
  ]
}}
Do not include any conversational preamble, markdown backticks outside json, or commentary. Output pure valid JSON.
"""


# ---------------------------------------------------------------------------
# STRATEGY C: FEW-SHOT PROMPTING
# Structured instructions PLUS two concrete, high-quality reference examples.
# ---------------------------------------------------------------------------
def build_strategy_c_prompt(proj: ProjectRequirements) -> str:
    reqs_text = format_requirements_block(proj)
    return f"""You are a Principal Software Quality Assurance Engineer and Test Architect.

### TASK
Generate an exhaustive, high-fidelity software test case suite derived strictly from the specification below.

### RULES & CONSTRAINTS
1. Traceability: Every requirement ID must appear in "requirement_ids" for its corresponding test cases.
2. Categories: Cover "positive", "negative", "boundary", "validation", and "security".
3. Discipline: Never invent unspecified numerical thresholds or policies. Record any necessary assumption in "assumptions".
4. Output: Return pure JSON conforming to the schema demonstrated in the examples below.

### EXAMPLE 1 (Nominal positive test)
[Sample Requirement]
REQ-EX1: User profile avatar upload must accept PNG and JPEG images up to 5MB.
[Output JSON]
{{
  "test_id": "TC-EX01",
  "requirement_ids": ["REQ-EX1"],
  "title": "Successful avatar upload with valid 2MB PNG image",
  "category": "positive",
  "priority": "high",
  "preconditions": ["User is authenticated and on Profile Edit page"],
  "steps": ["Click Upload Avatar button", "Select valid 2MB image.png file", "Click Save Changes"],
  "test_data": "File: user_profile.png (Size: 2,097,152 bytes, Format: image/png)",
  "expected_result": "Avatar preview updates immediately and server returns HTTP 200 with saved media URL",
  "assumptions": []
}}

### EXAMPLE 2 (Negative validation & boundary with assumption tracking)
[Sample Requirement]
REQ-EX2: Password reset tokens expire after an unconfigured security window.
[Output JSON]
{{
  "test_id": "TC-EX02",
  "requirement_ids": ["REQ-EX2"],
  "title": "Password reset token rejected after expiration window",
  "category": "security",
  "priority": "high",
  "preconditions": ["Password reset token generated for user@example.com"],
  "steps": ["Wait until token expiration time elapsed", "Navigate to reset URL with expired token parameter", "Submit new password credentials"],
  "test_data": "Token: 'exp_tok_99182', Target: user@example.com",
  "expected_result": "System rejects submission with message 'Reset link has expired' and prompts to request a new link",
  "assumptions": ["Assumed security policy window defaults to 15 minutes pending product confirmation"]
}}

### TARGET SPECIFICATION TO TEST
{reqs_text}

### REQUIRED OUTPUT
Now generate the complete test case suite for the Target Specification above. Return ONLY a JSON object containing the "test_cases" list adhering to the exact schema.
"""


def get_prompt_for_strategy(strategy_id: str, proj: ProjectRequirements) -> str:
    if strategy_id == "strategy_a":
        return build_strategy_a_prompt(proj)
    elif strategy_id == "strategy_b":
        return build_strategy_b_prompt(proj)
    elif strategy_id == "strategy_c":
        return build_strategy_c_prompt(proj)
    raise ValueError(f"Unknown strategy ID: {strategy_id}")
