"""
SpecCraft AI - FastAPI Main Application Server
Exposes endpoints for Ollama connectivity, prompt generation, Python-based evaluation,
experiment persistence, human-in-the-loop review, and CSV/JSON exports.
"""

import time
import json
import uuid
import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from backend.config import settings, DATA_DIR
from backend.schemas import (
    ProjectRequirements,
    TestCase,
    TestCaseCollection,
    EvaluationMetrics,
    StrategyRunResult,
    GenerationRequest,
    ModelComparisonRequest,
    HumanReviewUpdate,
    ExperimentRecord,
    OllamaStatus
)
from backend.prompts import (
    build_strategy_a_prompt,
    build_strategy_b_prompt,
    build_strategy_c_prompt,
    PROMPT_VERSION
)
from backend.ollama_service import ollama_service
from backend.evaluation import evaluate_test_cases
from backend.storage import experiment_storage
from backend.export import (
    export_test_cases_to_csv,
    export_test_cases_to_json,
    export_experiment_comparison_csv
)

app = FastAPI(
    title="SpecCraft AI Backend API",
    description="Prompt Engineering Requirements-to-Test-Case Generation & Evaluation Platform",
    version="1.0.0"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "online",
        "service": "SpecCraft AI",
        "version": "1.0.0",
        "prompt_version": PROMPT_VERSION
    }


@app.get("/api/ollama/status", response_model=OllamaStatus)
def get_ollama_status() -> OllamaStatus:
    """Check connectivity to Ollama and fetch list of downloaded models."""
    return ollama_service.check_health()


@app.get("/api/requirements/samples")
def get_sample_requirements() -> Dict[str, Any]:
    """Retrieve preloaded sample requirements datasets."""
    sample_file = settings.sample_requirements_path
    if not sample_file.exists():
        raise HTTPException(status_code=404, detail="Sample requirements dataset file missing")
    with open(sample_file, "r", encoding="utf-8") as f:
        return json.load(f)


def _execute_strategy(
    strategy_id: str,
    strategy_name: str,
    prompt: str,
    proj: ProjectRequirements,
    model_name: str,
    temperature: float,
    seed: Optional[int]
) -> StrategyRunResult:
    """Helper to dispatch generation to Ollama, parse response, and compute metrics."""
    try:
        gen_result = ollama_service.generate(
            prompt=prompt,
            model=model_name,
            temperature=temperature,
            seed=seed
        )
        raw_response = gen_result["raw_response"]
        wall_clock = gen_result["wall_clock_seconds"]
        prompt_tokens = gen_result.get("prompt_tokens")
        completion_tokens = gen_result.get("completion_tokens")
        total_tokens = gen_result.get("total_tokens")
        
        parsed_cases, validation_errors, repair_attempted, repaired_output = (
            ollama_service.parse_and_validate_json(raw_response, strategy_id)
        )
        
        metrics = evaluate_test_cases(
            test_cases=parsed_cases,
            requirements=proj,
            wall_clock_seconds=wall_clock,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens
        )

        strat_status = "success" if not validation_errors and parsed_cases else ("partial" if parsed_cases else "failed")

        return StrategyRunResult(
            strategy_id=strategy_id,  # type: ignore
            strategy_name=strategy_name,
            prompt_used=prompt,
            raw_response=raw_response,
            parsed_test_cases=parsed_cases,
            metrics=metrics,
            validation_errors=validation_errors,
            repair_attempted=repair_attempted,
            repaired_output=repaired_output,
            status=strat_status,
            error_message=None
        )
    except Exception as e:
        empty_metrics = evaluate_test_cases([], proj, 0.0)
        return StrategyRunResult(
            strategy_id=strategy_id,  # type: ignore
            strategy_name=strategy_name,
            prompt_used=prompt,
            raw_response="",
            parsed_test_cases=[],
            metrics=empty_metrics,
            validation_errors=[str(e)],
            repair_attempted=False,
            repaired_output=None,
            status="failed",
            error_message=str(e)
        )


@app.post("/api/generate", response_model=Dict[str, StrategyRunResult])
def generate_test_cases(request: GenerationRequest) -> Dict[str, StrategyRunResult]:
    """
    Generate test cases across selected prompt strategies:
    - strategy_a: Basic prompting
    - strategy_b: Structured prompting
    - strategy_c: Few-shot prompting
    - all: Compares all three concurrently under identical settings
    """
    proj = request.project_requirements
    if not proj.requirements:
        raise HTTPException(status_code=400, detail="Requirement list cannot be empty")

    results: Dict[str, StrategyRunResult] = {}
    
    strategies_to_run = []
    if request.strategy in ["strategy_a", "all"]:
        strategies_to_run.append(("strategy_a", "Strategy A: Basic Prompting", build_strategy_a_prompt(proj)))
    if request.strategy in ["strategy_b", "all"]:
        strategies_to_run.append(("strategy_b", "Strategy B: Structured Prompting", build_strategy_b_prompt(proj)))
    if request.strategy in ["strategy_c", "all"]:
        strategies_to_run.append(("strategy_c", "Strategy C: Few-Shot Prompting", build_strategy_c_prompt(proj)))

    for strat_id, strat_name, prompt_text in strategies_to_run:
        results[strat_id] = _execute_strategy(
            strategy_id=strat_id,
            strategy_name=strat_name,
            prompt=prompt_text,
            proj=proj,
            model_name=request.model_name,
            temperature=request.temperature,
            seed=request.seed
        )

    return results


@app.post("/api/compare-models", response_model=Dict[str, StrategyRunResult])
def compare_models(request: ModelComparisonRequest) -> Dict[str, StrategyRunResult]:
    """
    Compare multiple models (e.g. llama3:latest vs codellama:latest) using a fixed prompt strategy.
    Ensures model comparison results are kept separate from prompt strategy experiments.
    """
    proj = request.project_requirements
    if not proj.requirements:
        raise HTTPException(status_code=400, detail="Requirement list cannot be empty")

    if request.strategy_id == "strategy_a":
        prompt_text = build_strategy_a_prompt(proj)
        strat_name = "Strategy A: Basic Prompting"
    elif request.strategy_id == "strategy_c":
        prompt_text = build_strategy_c_prompt(proj)
        strat_name = "Strategy C: Few-Shot Prompting"
    else:
        prompt_text = build_strategy_b_prompt(proj)
        strat_name = "Strategy B: Structured Prompting"

    results: Dict[str, StrategyRunResult] = {}
    for model in request.models:
        results[model] = _execute_strategy(
            strategy_id=request.strategy_id,
            strategy_name=strat_name,
            prompt=prompt_text,
            proj=proj,
            model_name=model,
            temperature=request.temperature,
            seed=request.seed
        )

    return results


@app.post("/api/evaluate", response_model=EvaluationMetrics)
def evaluate_suite(
    test_cases: List[TestCase],
    requirements: ProjectRequirements,
    generation_time_seconds: float = 0.0,
    prompt_tokens: Optional[int] = None,
    completion_tokens: Optional[int] = None
) -> EvaluationMetrics:
    """Run the evaluation engine independently on any arbitrary test case set."""
    return evaluate_test_cases(
        test_cases=test_cases,
        requirements=requirements,
        wall_clock_seconds=generation_time_seconds,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens
    )


@app.get("/api/experiments")
def list_experiments() -> List[Dict[str, Any]]:
    """List all saved experiment runs."""
    return experiment_storage.list_experiments()


@app.get("/api/experiments/{experiment_id}", response_model=ExperimentRecord)
def get_experiment(experiment_id: str) -> ExperimentRecord:
    """Retrieve full experiment record by ID."""
    record = experiment_storage.get_experiment(experiment_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found")
    return record


@app.post("/api/experiments", response_model=Dict[str, str])
def save_experiment(experiment: ExperimentRecord) -> Dict[str, str]:
    """Save an experiment record to local disk storage."""
    file_path = experiment_storage.save_experiment(experiment)
    return {"status": "saved", "id": experiment.id, "file_path": file_path}


@app.patch("/api/experiments/{experiment_id}/strategies/{strategy_id}/review")
def update_human_review(
    experiment_id: str,
    strategy_id: str,
    update_data: HumanReviewUpdate
) -> Dict[str, Any]:
    """Update human review categorization for a specific test case."""
    success = experiment_storage.update_human_review(experiment_id, strategy_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Test case or experiment record not found")
    return {"status": "updated", "test_id": update_data.test_id}


@app.post("/api/export/csv")
def export_csv(cases: List[TestCase]) -> PlainTextResponse:
    """Export test cases to RFC 4180 compliant CSV."""
    csv_data = export_test_cases_to_csv(cases)
    return PlainTextResponse(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=test_cases.csv"}
    )


@app.post("/api/export/json")
def export_json(cases: List[TestCase]) -> Response:
    """Export test cases to formatted JSON."""
    json_data = export_test_cases_to_json(cases)
    return Response(
        content=json_data,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=test_cases.json"}
    )


@app.get("/api/experiments/{experiment_id}/export-csv")
def export_experiment_csv(experiment_id: str) -> PlainTextResponse:
    """Export experiment strategy comparison benchmark to CSV."""
    record = experiment_storage.get_experiment(experiment_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found")
    csv_data = export_experiment_comparison_csv(record)
    return PlainTextResponse(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=benchmark_{experiment_id}.csv"}
    )
