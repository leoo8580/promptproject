"""
SpecCraft AI - Backend Configuration
Configuration settings for local Ollama integration, timeouts, and storage paths.
"""

import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
EXPERIMENTS_DIR = DATA_DIR / "experiments"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
EXPERIMENTS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    # Ollama settings
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    default_model: str = os.getenv("DEFAULT_MODEL", "llama3:latest")
    alternative_model: str = os.getenv("ALTERNATIVE_MODEL", "codellama:latest")
    request_timeout_seconds: float = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "120.0"))
    max_retries: int = int(os.getenv("MAX_RETRIES", "2"))
    
    # Prompt settings
    prompt_version: str = "v1.2.0"
    
    # Paths
    experiments_dir: Path = EXPERIMENTS_DIR
    sample_requirements_path: Path = DATA_DIR / "sample_requirements.json"

settings = Settings()
