# SpecCraft AI: Prompt Engineering-Based Requirements-to-Test-Case Generation and Evaluation Platform

**SpecCraft AI** is an academic and empirical evaluation platform designed to systematically measure and demonstrate how different prompt engineering strategies affect the structural quality, completeness, requirement coverage, and hallucination rate of automatically generated software test cases using local LLMs (via [Ollama](https://ollama.com/)).

---

## 1. Research & Architectural Overview

SpecCraft AI tests the hypothesis that **unstructured prompt engineering produces incomplete test suites with frequent hallucinated assumptions**, whereas **structured prompting and few-shot in-context learning systematically boost schema validity, requirement coverage, and adherence to unconfigured policies**.

### Evaluated Prompt Strategies
1. **Strategy A (Basic Prompting)**: Concise, task-only instruction without explicit category constraints or assumption guardrails.
2. **Strategy B (Structured Prompting)**: Role framing (Principal QA Architect), formal JSON schema, category enforcement (`positive`, `negative`, `boundary`, `validation`, `security`), and strict anti-hallucination rules.
3. **Strategy C (Few-Shot Prompting)**: Structured instructions augmented with two exemplar demonstrations illustrating nominal cases and unresolved security policy modeling with explicit assumption tracking.

### Measurable Quantitative Metrics (LLM-Independent Python Engine)
- **Requirement Coverage ($\%$):** $\frac{\text{covered predefined requirement IDs}}{\text{total predefined requirements}} \times 100$
- **Schema Validity ($\%$):** Percentage of test cases passing mandatory field type checks.
- **Completeness ($\%$):** Percentage containing title, requirement reference, category, step list, and expected result.
- **Duplicate Rate ($\%$):** Percentage of duplicate cases detected via normalized text signature matching.
- **Category Coverage:** Multi-class representation across positive, negative, boundary, validation, and security dimensions.
- **Generation Duration:** True wall-clock duration recorded per request.
- **Token Efficiency:** Prompt and completion tokens captured directly from Ollama.
- **Human Review Acceptance Rate ($\%$):** Acceptance ratio among human-evaluated cases.

---

## 2. Directory Structure

```text
├── backend/                        # Python FastAPI backend
│   ├── __init__.py
│   ├── config.py                   # Configuration and paths
│   ├── schemas.py                  # Pydantic data schemas
│   ├── prompts.py                  # Modular Strategy A, B, C templates
│   ├── ollama_service.py           # Local Ollama client & JSON repair
│   ├── evaluation.py               # Pure mathematical metrics engine
│   ├── storage.py                  # Local JSON experiment storage
│   ├── export.py                   # RFC 4180 CSV & JSON exports
│   └── main.py                     # FastAPI application endpoints
├── tests/                          # Automated pytest suite
│   ├── test_schemas.py             # Pydantic schema validation tests
│   ├── test_evaluation.py          # Metric formula calculation tests
│   ├── test_prompts.py             # Prompt difference & template tests
│   ├── test_exports.py             # CSV escaping & JSON format tests
│   ├── test_storage.py             # Storage & corrupted file tests
│   └── test_ollama_mock.py         # Mocked Ollama generation tests
├── data/                           # Data storage & preloaded samples
│   ├── sample_requirements.json    # REQ-001 through REQ-005 + 4 datasets
│   └── experiments/                # Stored experiment runs (.json)
├── src/                            # React & TypeScript Frontend
│   ├── components/                 # UI components and analytical views
│   ├── services/                   # API client and client-side evaluator
│   ├── types.ts                    # TypeScript interface declarations
│   └── App.tsx                     # Main dashboard layout
├── server.ts                       # Integrated development server
├── requirements.txt                # Python backend dependencies
├── package.json                    # Node dependencies & scripts
├── .env.example                    # Environment variable template
└── README.md                       # Complete documentation
```

---

## 3. Local Setup Instructions for Windows 10 & Windows 11

Follow these exact **PowerShell** steps to run the complete stack locally with your local Ollama daemon.

### Step 1: Install Prerequisites
Ensure you have installed:
- **Python 3.10+**: `winget install Python.Python.3.11`
- **Node.js 18+ / 20+**: `winget install OpenJS.NodeJS.LTS`
- **Ollama**: Download from [https://ollama.com/download/windows](https://ollama.com/download/windows) or run:
  ```powershell
  winget install Ollama.Ollama
  ```

### Step 2: Install and Start Ollama & Pull Models
Ollama version **0.40.13** or later is supported. Open a PowerShell terminal and pull the models:
```powershell
# Verify Ollama is running and check version
ollama --version

# Pull the default model: Llama 3
ollama pull llama3:latest

# Pull the alternative model for Model Comparison Mode: CodeLlama
ollama pull codellama:latest

# Verify installed models (SpecCraft AI dynamically detects these via GET /api/tags)
ollama list
```
*(Ollama runs as a background service on `http://localhost:11434` automatically in Windows. Note: SpecCraft AI will never auto-download models — install instructions are shown if a model is unavailable).*

### Step 3: Create Python Virtual Environment & Install Backend Dependencies
Open a PowerShell terminal in the project root directory:
```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install backend dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Install Frontend Dependencies
In the project root:
```powershell
npm install
```

### Step 5: Start the Backend and Frontend

#### Option A: Run Full-Stack Express Server (Unified on Port 3000)
Runs the unified full-stack server serving the UI and API gateway on port 3000:
```powershell
npm run dev
```
Open your browser to: **`http://localhost:3000`**

#### Option B: Run Python FastAPI Directly (Port 8000)
To run the native Python FastAPI backend directly:
```powershell
# In PowerShell Terminal 1 (Backend):
.\.venv\Scripts\Activate.ps1
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# In PowerShell Terminal 2 (Frontend):
npm run dev
```
FastAPI Swagger documentation will be available at: **`http://localhost:8000/docs`**

---

## 4. Running the Automated Test Suite

The test suite runs against mocked Ollama responses and requires no internet connection or active model:

```powershell
# Activate your virtual environment
.\.venv\Scripts\Activate.ps1

# Run pytest with verbose output
pytest -v

# Run with test coverage
pytest --cov=backend tests/
```

Test coverage includes:
- Schema validation with Pydantic (`test_schemas.py`)
- Requirement coverage, duplicate detection, completeness, and categories (`test_evaluation.py`)
- Prompt structure and anti-hallucination checks (`test_prompts.py`)
- RFC 4180 CSV escaping and JSON export structures (`test_exports.py`)
- Corrupted file resilience and JSON storage (`test_storage.py`)
- Connection failure handling and JSON repair (`test_ollama_mock.py`)

---

## 5. Intentional Benchmark Dataset & The REQ-005 Case Study

The platform includes a benchmark dataset (`data/sample_requirements.json`) representing an Authentication & Session Management service:
- **REQ-001**: Registered users can log in with valid credentials.
- **REQ-002**: Invalid credentials must display an appropriate error (preventing enumeration).
- **REQ-003**: Email format must be validated according to RFC 5322.
- **REQ-004**: Required fields cannot be empty.
- **REQ-005**: Repeated failed login attempts must follow the application's configured security policy (**Intentionally Unresolved**).

### Academic Significance of REQ-005
REQ-005 contains a deliberate specification gap: the lockout threshold (e.g. 3 attempts vs 5 attempts) is omitted.
- **Strategy A (Basic)** will routinely hallucinate an arbitrary number (e.g. "Account is locked after 3 attempts") and claim it as a verified system rule.
- **Strategy B (Structured)** adheres to anti-hallucination constraints and records an explicit assumption inside the `assumptions` array.
- **Strategy C (Few-Shot)** parametrically structures the test case following Example 2, isolating the threshold as an external configurable variable.

---

## 6. Troubleshooting Common Issues

1. **`Ollama is unreachable at http://localhost:11434`**:
   - Ensure the Ollama icon is visible in your Windows system tray, or start it manually in PowerShell:
     ```powershell
     ollama serve
     ```
   - Check if another process is using port 11434: `netstat -ano | findstr 11434`
2. **`Model 'qwen2.5:3b' not found`**:
   - Run `ollama pull qwen2.5:3b` in your terminal. You can also select another downloaded model from the SpecCraft AI Settings panel.
3. **`Execution of scripts is disabled on this system` (PowerShell error activating venv)**:
   - Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
4. **Cloud Sandbox Note**:
   - Cloud containers cannot reach your private `localhost:11434`. When viewing inside cloud preview environments, SpecCraft AI provides an integrated testbed engine displaying the exact measured metrics and prompt divergences, and can be pointed to any accessible remote Ollama endpoint.

---

## 7. Exporting Project Source
To bundle the complete project for academic submission or distribution:
```powershell
# Create clean distribution zip (excluding node_modules and .venv)
tar -czvf speccraft_ai_submission.tar.gz --exclude="node_modules" --exclude=".venv" --exclude=".git" .
```
