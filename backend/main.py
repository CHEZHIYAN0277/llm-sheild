"""
LLM Shield — FastAPI Backend
A lightweight API for detecting and scoring threats in LLM interactions.
"""

from fastapi import FastAPI
from pydantic import BaseModel

from threat_detector import ThreatDetector
from scoring_engine import calculate_risk

app = FastAPI(
    title="LLM Shield",
    description="Detect and score threats in LLM prompts and responses.",
    version="0.2.0",
)

# Load model once at startup — not per request
detector = ThreatDetector()


# --- Request / Response models ---

class PromptRequest(BaseModel):
    prompt: str


# --- Routes ---

@app.get("/health")
def health_check() -> dict:
    """Basic health-check endpoint."""
    return {"status": "ok"}


@app.post("/analyze")
def analyze(payload: PromptRequest) -> dict:
    """
    Analyze a prompt for threats and return a risk score.

    Expects JSON body: {"prompt": "..."}
    """
    analysis = detector.analyze(payload.prompt)
    risk = calculate_risk(analysis["threat_score"])

    return {
        "input": payload.prompt,
        "attack_type": analysis["attack_type"],
        "threat_score": risk["threat_score"],
        "risk_level": risk["risk_level"],
    }
