"""
Scoring Engine Module
Computes risk level and adaptive defense action from a threat score.
"""


def calculate_risk(threat_score: float) -> dict:
    """
    Determine the risk level and defense action from a threat score.

    Args:
        threat_score: A score from 0–100 produced by ThreatDetector.

    Returns:
        A dict with threat_score, risk_level, and action.
    """
    if threat_score <= 30:
        risk_level = "Safe"
        action = "ALLOW"
    elif threat_score <= 60:
        risk_level = "Suspicious"
        action = "WARN"
    elif threat_score <= 80:
        risk_level = "High"
        action = "REQUIRE_CONFIRMATION"
    else:
        risk_level = "Critical"
        action = "BLOCK"

    return {
        "threat_score": threat_score,
        "risk_level": risk_level,
        "action": action,
    }
