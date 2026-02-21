"""
Threat Detector Module
Deterministic rule-based detection system for LLM prompt threats.
No ML dependencies — fast, stable, and predictable.
"""

# High-risk prompt injection patterns
PROMPT_INJECTION_PATTERNS = [
    "ignore previous instructions",
    "reveal system prompt",
    "hidden policy",
    "bypass safety",
    "developer mode",
    "print internal instructions",
    "override rules",
]

# Data extraction patterns
DATA_EXTRACTION_PATTERNS = [
    "password",
    "api key",
    "secret",
    "token",
    "confidential",
]


class ThreatDetector:
    """Detects adversarial threats using deterministic rule-based matching."""

    def analyze(self, prompt: str) -> dict:
        """
        Analyze a prompt against known threat patterns.

        Args:
            prompt: The raw user prompt to analyze.

        Returns:
            A dict with attack_type and threat_score (0–100).
        """
        prompt_lower = prompt.lower()

        # Check for prompt injection (highest priority)
        for pattern in PROMPT_INJECTION_PATTERNS:
            if pattern in prompt_lower:
                return {
                    "attack_type": "Prompt Injection",
                    "threat_score": 95,
                }

        # Check for data extraction attempts
        for pattern in DATA_EXTRACTION_PATTERNS:
            if pattern in prompt_lower:
                return {
                    "attack_type": "Data Extraction Attempt",
                    "threat_score": 85,
                }

        # No threats detected
        return {
            "attack_type": "Benign",
            "threat_score": 5,
        }
