# LLM Shield — Backend

A lightweight FastAPI service for detecting and scoring threats in LLM interactions.

## Project Structure

```
backend/
├── main.py              # FastAPI app and route definitions
├── threat_detector.py   # Prompt / response threat analysis
├── scoring_engine.py    # Risk scoring from threat signals
├── llm_handler.py       # LLM provider communication
├── requirements.txt     # Python dependencies
└── README.md
```

## Quick Start

```bash
# 1. Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the dev server
uvicorn main:app --reload
```

The API will be available at **http://127.0.0.1:8000**.  
Interactive docs at **http://127.0.0.1:8000/docs**.

## API Endpoints

| Method | Path                | Description                          |
|--------|---------------------|--------------------------------------|
| GET    | `/health`           | Health check                         |
| POST   | `/analyze/prompt`   | Analyze a prompt for threats         |
| POST   | `/analyze/response` | Analyze an LLM response for threats  |
| POST   | `/llm/send`         | Full pipeline: analyze → send → score|

## Notes

- **No database** — all processing is stateless and in-memory.
- **No authentication** — intended for local development only.
- **Apple Silicon optimized** — dependencies chosen to run natively on M-series Macs.
