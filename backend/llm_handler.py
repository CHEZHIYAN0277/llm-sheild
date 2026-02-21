"""
LLM Handler Module
Manages communication with Ollama for local LLM inference.
"""

import requests


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"
OLLAMA_TIMEOUT = 120  # seconds (first run may be slow while model loads)


def generate_response(prompt: str) -> str:
    """
    Send a prompt to Ollama and return the generated text.

    Args:
        prompt: The user prompt to send to the LLM.

    Returns:
        The generated response text, or an error message on failure.
    """
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=OLLAMA_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json().get("response", "")
    except requests.ConnectionError:
        return "[Error] Could not connect to Ollama. Is it running on localhost:11434?"
    except requests.Timeout:
        return "[Error] Ollama request timed out after 30 seconds."
    except requests.RequestException as e:
        return f"[Error] Ollama request failed: {e}"
