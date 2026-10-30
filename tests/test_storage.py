"""
Tests for local experiment storage:
Verifies save, retrieve, missing file handling, and resilience against corrupted JSON files.
"""

import json
from pathlib import Path
from backend.storage import ExperimentStorage
from backend.schemas import (
    ExperimentRecord,
    ProjectRequirements,
    StrategyRunResult,
    EvaluationMetrics,
    HumanReviewUpdate
)

def test_storage_lifecycle_and_corruption_resilience(tmp_path: Path):
    storage = ExperimentStorage(storage_dir=tmp_path)
    
    # 1. Initially empty
    assert len(storage.list_experiments()) == 0

    # 2. Save valid experiment
    proj = ProjectRequirements(project_name="Demo Proj", requirements=[])
    metrics = EvaluationMetrics()
    exp = ExperimentRecord(
        id="exp-test-01",
        timestamp="2026-10-29T10:00:00Z",
        project_name="Demo Proj",
        model_name="qwen2.5:3b",
        temperature=0.2,
        seed=42,
        prompt_version="v1.2.0",
        requirements_snapshot=proj,
        strategy_results={}
    )
    storage.save_experiment(exp)

    # Verify retrieval
    loaded = storage.get_experiment("exp-test-01")
    assert loaded is not None
    assert loaded.id == "exp-test-01"

    # 3. Simulate a corrupted file
    corrupt_file = tmp_path / "corrupted_experiment.json"
    corrupt_file.write_text("{ this is not valid json! }}", encoding="utf-8")

    # Listing must not crash; must mark is_corrupted=True for that entry
    summaries = storage.list_experiments()
    assert len(summaries) == 2
    corrupt_summary = next(s for s in summaries if s["id"] == "corrupted_experiment")
    assert corrupt_summary["is_corrupted"] is True

    # 4. Non-existent experiment
    missing = storage.get_experiment("exp-does-not-exist")
    assert missing is None
