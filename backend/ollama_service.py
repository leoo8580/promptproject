"""
SpecCraft AI - Ollama Integration Service
Manages local connection to Ollama at http://localhost:11434 (Ollama 0.40.13 API),
retrieves installed models via GET /api/tags, dispatches generation via POST /api/generate
with format="json" and stream=false, captures wall-clock time, load duration, token counts,
and timing metadata, and handles JSON validation and automatic repair.
Never automatically downloads or installs models.
"""

import time
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Tuple, Optional
from backend.config import settings
from backend.schemas import TestCase, OllamaStatus

class OllamaService:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self.timeout = settings.request_timeout_seconds

    def check_health(self) -> OllamaStatus:
        """
        Check if local Ollama daemon is running and list available models from GET /api/tags.
        Populates available models dynamically.
        Never automatically downloads models.
        """
        url = f"{self.base_url}/api/tags"
        instructions = {
            "llama3:latest": "ollama pull llama3:latest",
            "codellama:latest": "ollama pull codellama:latest",
        }
        try:
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=3.0) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    models = [m.get("name", "") for m in data.get("models", []) if m.get("name")]
                    
                    # Preference: llama3:latest > codellama:latest > first installed > default_model
                    if settings.default_model in models:
                        selected = settings.default_model
                    elif settings.alternative_model in models:
                        selected = settings.alternative_model
                    elif models:
                        selected = models[0]
                    else:
                        selected = settings.default_model

                    msg = f"Connected to local Ollama (0.40.13 API). Found {len(models)} installed model(s)."
                    if "llama3:latest" not in models:
                        msg += " 'llama3:latest' is not installed; run `ollama pull llama3:latest`."

                    return OllamaStatus(
                        reachable=True,
                        endpoint=self.base_url,
                        selected_model=selected,
                        available_models=models,
                        message=msg,
                        installation_instructions=instructions
                    )
        except urllib.error.URLError:
            return OllamaStatus(
                reachable=False,
                endpoint=self.base_url,
                selected_model=settings.default_model,
                available_models=[],
                message=(
                    f"Ollama is unreachable at {self.base_url}. "
                    "Ensure Ollama is started locally (`ollama serve`) and models are installed via `ollama pull llama3:latest`."
                ),
                installation_instructions=instructions
            )
        except Exception as e:
            return OllamaStatus(
                reachable=False,
                endpoint=self.base_url,
                selected_model=settings.default_model,
                available_models=[],
                message=f"Connection check error: {str(e)}",
                installation_instructions=instructions
            )

    def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.2,
        seed: Optional[int] = 42,
        system_msg: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send generation request to Ollama using POST http://localhost:11434/api/generate.
        Uses format="json" and stream=false.
        Never automatically downloads or installs models.
        Captures wall-clock time, load duration, eval duration, token counts, and timing metadata.
        """
        chosen_model = model or settings.default_model

        # Pre-check available models to never trigger automatic downloads
        status = self.check_health()
        if status.reachable and status.available_models and chosen_model not in status.available_models:
            raise ValueError(
                f"Model '{chosen_model}' is not installed in local Ollama. "
                f"To install it, run in PowerShell: `ollama pull {chosen_model}`. "
                "Automatic downloading is disabled."
            )

        payload: Dict[str, Any] = {
            "model": chosen_model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": temperature,
            }
        }
        if seed is not None:
            payload["options"]["seed"] = seed
        if system_msg:
            payload["system"] = system_msg

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/api/generate",
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        start_time = time.perf_counter()
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                elapsed = time.perf_counter() - start_time
                if resp.status != 200:
                    raise RuntimeError(f"Ollama returned HTTP status {resp.status}")
                raw_body = resp.read().decode("utf-8")
                res_json = json.loads(raw_body)
                
                response_text = res_json.get("response", "")
                prompt_tokens = res_json.get("prompt_eval_count")
                eval_tokens = res_json.get("eval_count")
                total_tokens = ((prompt_tokens or 0) + (eval_tokens or 0)) if (prompt_tokens is not None or eval_tokens is not None) else None
                
                # Timing metadata from Ollama 0.40.13
                total_duration_ns = res_json.get("total_duration")
                load_duration_ns = res_json.get("load_duration")
                eval_duration_ns = res_json.get("eval_duration")
                
                load_duration_ms = round(load_duration_ns / 1e6, 2) if load_duration_ns is not None else None
                eval_duration_ms = round(eval_duration_ns / 1e6, 2) if eval_duration_ns is not None else None
                
                tokens_per_sec = None
                if eval_tokens and eval_duration_ns and eval_duration_ns > 0:
                    tokens_per_sec = round(eval_tokens / (eval_duration_ns / 1e9), 1)

                wall_clock = round(total_duration_ns / 1e9, 2) if total_duration_ns else round(elapsed, 2)

                return {
                    "raw_response": response_text,
                    "wall_clock_seconds": wall_clock,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": eval_tokens,
                    "total_tokens": total_tokens,
                    "load_duration_ms": load_duration_ms,
                    "eval_duration_ms": eval_duration_ms,
                    "tokens_per_second": tokens_per_sec,
                    "model": res_json.get("model", chosen_model),
                    "done": res_json.get("done", True)
                }
        except urllib.error.URLError as e:
            elapsed = time.perf_counter() - start_time
            raise ConnectionError(
                f"Failed to connect to Ollama at {self.base_url}: {e.reason}. "
                "Ensure local Ollama service is active via `ollama serve`."
            )
        except Exception as e:
            elapsed = time.perf_counter() - start_time
            raise RuntimeError(f"Ollama generation failed after {elapsed:.2f}s: {str(e)}")

    def parse_and_validate_json(
        self,
        raw_text: str,
        strategy_id: str
    ) -> Tuple[List[TestCase], List[str], bool, Optional[str]]:
        """
        Parse raw model response into validated TestCase instances.
        Attempts recovery and repairing of common JSON syntax errors.
        Returns: (parsed_cases, validation_errors, repair_attempted, repaired_output)
        """
        validation_errors: List[str] = []
        repair_attempted = False
        repaired_output: Optional[str] = None
        cleaned_text = raw_text.strip()

        # Strip markdown code blocks if present
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()

        data: Any = None
        try:
            data = json.loads(cleaned_text)
        except json.JSONDecodeError as primary_err:
            repair_attempted = True
            repaired_text = self._attempt_json_repair(cleaned_text)
            repaired_output = repaired_text
            try:
                data = json.loads(repaired_text)
            except Exception as repair_err:
                validation_errors.append(f"JSON Syntax Error: {primary_err.msg} at line {primary_err.lineno}, col {primary_err.colno}")
                validation_errors.append(f"Repair attempt also failed: {str(repair_err)}")
                return [], validation_errors, repair_attempted, repaired_output

        # Extract test case list
        raw_cases: List[Dict[str, Any]] = []
        if isinstance(data, dict):
            if "test_cases" in data and isinstance(data["test_cases"], list):
                raw_cases = data["test_cases"]
            elif "tests" in data and isinstance(data["tests"], list):
                raw_cases = data["tests"]
            else:
                possible = [v for k, v in data.items() if isinstance(v, dict) and "title" in v]
                if possible:
                    raw_cases = possible
                else:
                    validation_errors.append("JSON root does not contain a 'test_cases' array.")
        elif isinstance(data, list):
            raw_cases = data
        else:
            validation_errors.append(f"Expected JSON object or list, got {type(data).__name__}")
            return [], validation_errors, repair_attempted, repaired_output

        parsed_cases: List[TestCase] = []
        for i, item in enumerate(raw_cases):
            if not isinstance(item, dict):
                validation_errors.append(f"Item #{i+1} is not a JSON object: {str(item)[:60]}")
                continue
            
            test_id = item.get("test_id") or f"TC-{i+1:03d}"
            title = str(item.get("title", "")).strip()
            category = str(item.get("category", "positive")).strip().lower()
            priority = str(item.get("priority", "medium")).strip().lower()
            expected_result = str(item.get("expected_result", "")).strip()
            test_data = str(item.get("test_data", ""))
            
            # Steps normalization
            steps_raw = item.get("steps", [])
            if isinstance(steps_raw, str):
                steps = [s.strip() for s in steps_raw.split("\n") if s.strip()]
            elif isinstance(steps_raw, list):
                steps = [str(s).strip() for s in steps_raw]
            else:
                steps = []

            # Preconditions
            pre_raw = item.get("preconditions", [])
            if isinstance(pre_raw, str):
                preconditions = [p.strip() for p in pre_raw.split("\n") if p.strip()]
            elif isinstance(pre_raw, list):
                preconditions = [str(p).strip() for p in pre_raw]
            else:
                preconditions = []

            # Assumptions
            assump_raw = item.get("assumptions", [])
            if isinstance(assump_raw, str):
                assumptions = [a.strip() for a in assump_raw.split("\n") if a.strip()]
            elif isinstance(assump_raw, list):
                assumptions = [str(a).strip() for a in assump_raw]
            else:
                assumptions = []

            # Requirement IDs
            req_ids_raw = item.get("requirement_ids") or item.get("requirement_id") or []
            if isinstance(req_ids_raw, str):
                req_ids = [r.strip() for r in req_ids_raw.replace(",", " ").split() if r.strip()]
            elif isinstance(req_ids_raw, list):
                req_ids = [str(r).strip() for r in req_ids_raw if str(r).strip()]
            else:
                req_ids = []

            try:
                tc = TestCase(
                    test_id=test_id,
                    requirement_ids=req_ids,
                    title=title,
                    category=category,
                    priority=priority,
                    preconditions=preconditions,
                    steps=steps,
                    test_data=test_data,
                    expected_result=expected_result,
                    assumptions=assumptions,
                    strategy_id=strategy_id
                )
                parsed_cases.append(tc)
            except Exception as e:
                validation_errors.append(f"Validation error in item #{i+1} ({test_id}): {str(e)}")

        return parsed_cases, validation_errors, repair_attempted, repaired_output

    def _attempt_json_repair(self, malformed_text: str) -> str:
        """Heuristic JSON repair for unclosed brackets, trailing commas, single quotes."""
        repaired = malformed_text.strip()
        import re
        repaired = re.sub(r",\s*([\]}])", r"\1", repaired)
        
        open_braces = repaired.count("{") - repaired.count("}")
        open_brackets = repaired.count("[") - repaired.count("]")
        
        if open_brackets > 0:
            repaired += "]" * open_brackets
        if open_braces > 0:
            repaired += "}" * open_braces
            
        return repaired

ollama_service = OllamaService()
