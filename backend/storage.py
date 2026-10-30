"""
SpecCraft AI - Local Experiment Storage
Persists experiment runs to local JSON files in data/experiments/.
Handles corrupted, missing, and malformed history files gracefully.
"""

import json
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from backend.config import settings
from backend.schemas import ExperimentRecord, HumanReviewUpdate

logger = logging.getLogger(__name__)

class ExperimentStorage:
    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = storage_dir or settings.experiments_dir
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def save_experiment(self, experiment: ExperimentRecord) -> str:
        """Save an experiment record to a local JSON file."""
        file_path = self.storage_dir / f"{experiment.id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(experiment.model_dump_json(indent=2))
        return str(file_path)

    def list_experiments(self) -> List[Dict[str, Any]]:
        """List all saved experiments with summary metadata, ignoring corrupted files."""
        summaries: List[Dict[str, Any]] = []
        if not self.storage_dir.exists():
            return summaries

        for file_path in sorted(self.storage_dir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                # Basic validation
                exp_id = data.get("id", file_path.stem)
                timestamp = data.get("timestamp", "")
                project_name = data.get("project_name", "Unknown Project")
                model_name = data.get("model_name", "Unknown Model")
                strategy_keys = list(data.get("strategy_results", {}).keys())
                
                # Count total test cases generated across strategies
                total_cases = 0
                for strat_res in data.get("strategy_results", {}).values():
                    cases = strat_res.get("parsed_test_cases", [])
                    total_cases += len(cases)

                summaries.append({
                    "id": exp_id,
                    "filename": file_path.name,
                    "timestamp": timestamp,
                    "project_name": project_name,
                    "model_name": model_name,
                    "strategies": strategy_keys,
                    "total_test_cases": total_cases,
                    "is_corrupted": False
                })
            except Exception as e:
                # Handle corrupted file without crashing
                logger.warning(f"Failed to read experiment file {file_path.name}: {e}")
                summaries.append({
                    "id": file_path.stem,
                    "filename": file_path.name,
                    "timestamp": "Corrupted / Unreadable",
                    "project_name": "Error reading record",
                    "model_name": "-",
                    "strategies": [],
                    "total_test_cases": 0,
                    "is_corrupted": True,
                    "error": str(e)
                })

        return summaries

    def get_experiment(self, experiment_id: str) -> Optional[ExperimentRecord]:
        """Load an individual experiment record by ID."""
        file_path = self.storage_dir / f"{experiment_id}.json"
        if not file_path.exists():
            return None
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return ExperimentRecord.model_validate(data)
        except Exception as e:
            logger.error(f"Error validating experiment record {experiment_id}: {e}")
            raise ValueError(f"Experiment file {file_path.name} is corrupted: {str(e)}")

    def update_human_review(
        self,
        experiment_id: str,
        strategy_id: str,
        review_update: HumanReviewUpdate
    ) -> bool:
        """Update the human review status of a test case inside an existing experiment."""
        exp = self.get_experiment(experiment_id)
        if not exp:
            return False

        strat_res = exp.strategy_results.get(strategy_id)
        if not strat_res:
            return False

        found = False
        for tc in strat_res.parsed_test_cases:
            if tc.test_id == review_update.test_id:
                tc.human_review_status = review_update.status
                if review_update.notes is not None:
                    tc.human_notes = review_update.notes
                tc.flagged_unsupported_assumptions = review_update.flagged_unsupported
                found = True
                break

        if found:
            # Recompute human metrics
            from backend.evaluation import evaluate_test_cases
            updated_metrics = evaluate_test_cases(
                strat_res.parsed_test_cases,
                exp.requirements_snapshot,
                strat_res.metrics.generation_time_seconds,
                strat_res.metrics.prompt_tokens,
                strat_res.metrics.completion_tokens,
                strat_res.metrics.total_tokens
            )
            strat_res.metrics = updated_metrics
            self.save_experiment(exp)
            return True
        return False

experiment_storage = ExperimentStorage()
