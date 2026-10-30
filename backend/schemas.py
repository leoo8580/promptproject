"""
SpecCraft AI - Pydantic Data Schemas
Structured models for requirements, test cases, evaluation metrics, experiments, and requests.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator
import datetime

# Test category and priority types
CategoryType = Literal["positive", "negative", "boundary", "validation", "security"]
PriorityType = Literal["high", "medium", "low"]
ReviewStatus = Literal["unreviewed", "acceptable", "needs_improvement", "incorrect"]

class RequirementItem(BaseModel):
    id: str = Field(..., description="Unique requirement ID, e.g., REQ-001")
    title: str = Field(..., description="Short title of the requirement")
    description: str = Field(..., description="Detailed requirement specification")
    acceptance_criteria: List[str] = Field(default_factory=list, description="Specific acceptance criteria")
    is_unresolved: bool = Field(default=False, description="Whether the requirement has unresolved policies or ambiguities")
    unresolved_note: Optional[str] = Field(default=None, description="Notes on what specification is missing from user")

class ProjectRequirements(BaseModel):
    project_name: str
    requirements: List[RequirementItem] = Field(default_factory=list)
    system_assumptions: List[str] = Field(default_factory=list)

class TestCase(BaseModel):
    test_id: str = Field(..., description="Unique test case identifier, e.g., TC-001")
    requirement_ids: List[str] = Field(default_factory=list, description="Associated requirement identifiers, e.g. ['REQ-001']")
    title: str = Field(..., description="Clear, concise descriptive title")
    category: str = Field(..., description="Category: positive, negative, boundary, validation, or security")
    priority: str = Field(default="medium", description="Priority level: high, medium, or low")
    preconditions: List[str] = Field(default_factory=list, description="Initial preconditions before test step execution")
    steps: List[str] = Field(..., description="Ordered list of execution steps")
    test_data: Optional[str] = Field(default="", description="Specific test inputs or data fixtures")
    expected_result: str = Field(..., description="Predicted expected outcome or assertion")
    assumptions: List[str] = Field(default_factory=list, description="Assumptions made by the generator")
    
    # Human in the loop review fields
    human_review_status: ReviewStatus = Field(default="unreviewed")
    human_notes: Optional[str] = Field(default=None)
    flagged_unsupported_assumptions: bool = Field(default=False)
    
    # Metadata
    strategy_id: Optional[str] = Field(default=None)
    created_at: Optional[str] = Field(default=None)

    @field_validator("category")
    @classmethod
    def normalize_category(cls, v: str) -> str:
        clean = v.strip().lower()
        valid = ["positive", "negative", "boundary", "validation", "security"]
        if clean in valid:
            return clean
        for cat in valid:
            if cat in clean:
                return cat
        return clean

class TestCaseCollection(BaseModel):
    test_cases: List[TestCase] = Field(default_factory=list)

class EvaluationMetrics(BaseModel):
    total_test_cases: int = 0
    total_requirements: int = 0
    covered_requirements: int = 0
    requirement_coverage_pct: float = 0.0  # (covered / total) * 100
    
    valid_test_cases: int = 0
    schema_validity_pct: float = 0.0      # (valid / total) * 100
    
    complete_test_cases: int = 0
    completeness_pct: float = 0.0         # (complete / total) * 100
    
    duplicate_count: int = 0
    duplicate_rate_pct: float = 0.0       # (duplicate / total) * 100
    
    categories_represented: List[str] = Field(default_factory=list)
    missing_categories: List[str] = Field(default_factory=list)
    category_counts: Dict[str, int] = Field(default_factory=dict)
    
    generation_time_seconds: float = 0.0
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    load_duration_ms: Optional[float] = None
    eval_duration_ms: Optional[float] = None
    tokens_per_second: Optional[float] = None
    
    # Human evaluation
    reviewed_count: int = 0
    acceptable_count: int = 0
    needs_improvement_count: int = 0
    incorrect_count: int = 0
    human_acceptance_rate_pct: Optional[float] = None

class StrategyRunResult(BaseModel):
    strategy_id: str
    strategy_name: str
    prompt_used: str
    raw_response: str
    parsed_test_cases: List[TestCase] = Field(default_factory=list)
    metrics: EvaluationMetrics
    validation_errors: List[str] = Field(default_factory=list)
    repair_attempted: bool = False
    repaired_output: Optional[str] = None
    status: Literal["success", "partial", "failed"] = "success"
    error_message: Optional[str] = None
    model_name: Optional[str] = None

class GenerationRequest(BaseModel):
    project_requirements: ProjectRequirements
    strategy: Literal["strategy_a", "strategy_b", "strategy_c", "all"] = "all"
    model_name: str = "llama3:latest"
    temperature: float = 0.2
    seed: Optional[int] = 42
    system_prompt_version: str = "v1.2.0"

class ModelComparisonRequest(BaseModel):
    project_requirements: ProjectRequirements
    models: List[str] = Field(default_factory=lambda: ["llama3:latest", "codellama:latest"])
    strategy: Literal["strategy_a", "strategy_b", "strategy_c"] = "strategy_b"
    temperature: float = 0.2
    seed: Optional[int] = 42

class HumanReviewUpdate(BaseModel):
    test_id: str
    status: ReviewStatus
    notes: Optional[str] = None
    flagged_unsupported: bool = False

class ExperimentRecord(BaseModel):
    id: str
    timestamp: str
    project_name: str
    model_name: str
    temperature: float
    seed: Optional[int] = None
    prompt_version: str
    requirements_snapshot: ProjectRequirements
    strategy_results: Dict[str, StrategyRunResult]
    summary_notes: Optional[str] = None
    experiment_type: Literal["prompt_strategy", "model_comparison"] = "prompt_strategy"
    compared_models: Optional[List[str]] = None
    fixed_strategy: Optional[str] = None

class OllamaStatus(BaseModel):
    reachable: bool
    endpoint: str
    selected_model: str
    available_models: List[str] = Field(default_factory=list)
    message: str
    installation_instructions: Optional[Dict[str, str]] = None
