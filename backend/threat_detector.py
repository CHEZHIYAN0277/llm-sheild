"""
Threat Detector Module
Deterministic rule-based detection with explainable results.
Returns matched pattern and human-readable reason for every detection.
"""

# Prompt injection rules: pattern → reason
PROMPT_INJECTION_RULES = {
    "ignore previous instructions": "Instruction override attempt",
    "ignore all instructions": "Instruction override attempt",
    "ignore the above": "Instruction override attempt",
    "ignore your instructions": "Instruction override attempt",
    "disregard previous instructions": "Instruction override attempt",
    "disregard all instructions": "Instruction override attempt",
    "forget your instructions": "Instruction override attempt",
    "reveal system prompt": "System prompt extraction attempt",
    "print system prompt": "System prompt extraction attempt",
    "show system prompt": "System prompt extraction attempt",
    "display system prompt": "System prompt extraction attempt",
    "output system prompt": "System prompt extraction attempt",
    "what is your system prompt": "System prompt extraction attempt",
    "repeat the above": "System prompt extraction attempt",
    "repeat everything above": "System prompt extraction attempt",
    "hidden policy": "Policy extraction attempt",
    "bypass safety": "Safety bypass attempt",
    "bypass restrictions": "Safety bypass attempt",
    "bypass filters": "Safety bypass attempt",
    "developer mode": "Developer mode exploitation attempt",
    "print internal instructions": "Internal instruction extraction attempt",
    "show internal instructions": "Internal instruction extraction attempt",
    "override rules": "Rule override attempt",
    "act as dan": "Jailbreak attempt (DAN)",
    "do anything now": "Jailbreak attempt (DAN)",
    "jailbreak": "Jailbreak attempt",
    "you are now": "Role hijacking attempt",
    "pretend you are": "Role hijacking attempt",
    "you have no restrictions": "Restriction removal attempt",
    "no restrictions": "Restriction removal attempt",
}

# Data extraction rules: pattern → reason
DATA_EXTRACTION_RULES = {
    "password": "Sensitive credential retrieval attempt",
    "api key": "Sensitive credential retrieval attempt",
    "secret key": "Secret data extraction attempt",
    "secret": "Secret data extraction attempt",
    "token": "Authentication token extraction attempt",
    "confidential": "Confidential data access attempt",
    "private key": "Cryptographic key extraction attempt",
    "credit card": "Financial data extraction attempt",
    "social security": "PII extraction attempt",
    "ssn": "PII extraction attempt",
}


class ThreatDetector:
    """Detects adversarial threats with explainable results."""

    def analyze(self, prompt: str) -> dict:
        """
        Analyze a prompt against known threat patterns.

        Args:
            prompt: The raw user prompt to analyze.

        Returns:
            A dict with threat_score, attack_type, matched_pattern, and reason.
        """
        prompt_lower = prompt.lower()

        # Check prompt injection rules (highest priority)
        for pattern, reason in PROMPT_INJECTION_RULES.items():
            if pattern in prompt_lower:
                return {
                    "threat_score": 95,
                    "attack_type": "Prompt Injection",
                    "matched_pattern": pattern,
                    "reason": reason,
                }

        # Check data extraction rules
        for pattern, reason in DATA_EXTRACTION_RULES.items():
            if pattern in prompt_lower:
                return {
                    "threat_score": 85,
                    "attack_type": "Data Extraction Attempt",
                    "matched_pattern": pattern,
                    "reason": reason,
                }

        # No threats detected
        return {
            "threat_score": 5,
            "attack_type": "Benign",
            "matched_pattern": None,
            "reason": "No malicious pattern detected",
        }
