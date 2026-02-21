"""
Scoring Engine Module
Computes a risk level from a threat score.
"""


def calculate_risk(threat_score: float) -> dict:
    """
    Determine the risk level from a threat score.

    Args:
        threat_score: A score from 0–100 produced by ThreatDetector.

    Returns:
        A dict with the threat_score and its risk_level string.
    """
    if threat_score <= 30:
        risk_level = "Safe"
    elif threat_score <= 60:
        risk_level = "Suspicious"
    elif threat_score <= 80:
        risk_level = "High"
    else:
        risk_level = "Critical"

    return {
        "threat_score": threat_score,
        "risk_level": risk_level,
    }
