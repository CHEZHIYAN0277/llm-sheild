"""
Document Poisoning Scanner (RAG Defense)
Detects injected or anomalous content within documents using:
  1. Rule-based injection pattern matching (existing ThreatDetector)
  2. Semantic deviation from document centroid (sentence embeddings)
  3. Statistical outlier detection (IsolationForest)
"""

from __future__ import annotations

from typing import TYPE_CHECKING

import numpy as np
from sklearn.ensemble import IsolationForest

if TYPE_CHECKING:
    from sentence_transformers import SentenceTransformer

# Lazily loaded at startup via init_model()
_model: "SentenceTransformer | None" = None

SEMANTIC_DEVIATION_THRESHOLD = 0.30  # cosine distance from centroid


# ── Model lifecycle ──────────────────────────────────────────────


def init_model() -> None:
    """Load the sentence-transformer model once at startup."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def _get_model() -> "SentenceTransformer":
    if _model is None:
        raise RuntimeError("Call init_model() before using the scanner.")
    return _model


# ── Chunking ─────────────────────────────────────────────────────


def _chunk_text(text: str) -> list[str]:
    """
    Split text into per-sentence chunks for maximum anomaly detection
    granularity. Each sentence is treated as an independent chunk so the
    semantic and statistical layers can pinpoint exactly which sentence
    deviates from the document's topic.

    For very long documents (> 30 sentences), groups of 2 are used to
    keep processing fast.
    """
    import re

    # Split on sentence boundaries (.  !  ?)
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]

    if len(sentences) <= 1:
        return [text.strip()]

    # For long documents, group into pairs to keep chunk count manageable
    if len(sentences) > 30:
        chunks: list[str] = []
        for i in range(0, len(sentences), 2):
            chunk = " ".join(sentences[i : i + 2])
            if chunk:
                chunks.append(chunk)
        return chunks

    # For normal documents, each sentence = one chunk
    return sentences


# ── Cosine distance ──────────────────────────────────────────────


def _cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    dot = float(np.dot(a, b))
    norm_a = float(np.linalg.norm(a))
    norm_b = float(np.linalg.norm(b))
    if norm_a == 0 or norm_b == 0:
        return 1.0
    return 1.0 - (dot / (norm_a * norm_b))


# ── Main scan pipeline ───────────────────────────────────────────


def scan_document(text: str, threat_detector) -> dict:
    """
    Scan a document for poisoning / injection.

    Args:
        text:             The raw document text.
        threat_detector:  An instance of ThreatDetector for rule-based checks.

    Returns:
        {
            "document_risk_score": int,
            "anomaly_chunks": [...],
            "threat_level": str,
            "total_chunks": int,
        }
    """
    model = _get_model()
    chunks = _chunk_text(text)
    num_chunks = len(chunks)

    # ── 1. Generate embeddings ──
    embeddings = model.encode(chunks, show_progress_bar=False, convert_to_numpy=True)
    embeddings = np.array(embeddings, dtype=np.float32)

    # ── 2. Compute centroid & semantic distances ──
    centroid = embeddings.mean(axis=0)
    distances = [_cosine_distance(emb, centroid) for emb in embeddings]

    # ── 3. IsolationForest anomaly detection ──
    iso_labels = np.ones(num_chunks, dtype=int)  # default: inlier
    if num_chunks >= 6:
        iso = IsolationForest(
            n_estimators=50,
            contamination=0.1,  # fixed: expect max 10% anomalies
            random_state=42,
        )
        iso_labels = iso.fit_predict(embeddings)  # -1 = outlier, 1 = inlier

    # ── Precompute adaptive semantic threshold ──
    mean_dist = float(np.mean(distances))
    std_dist = float(np.std(distances)) if num_chunks >= 3 else 0.0
    adaptive_threshold = mean_dist + 2.0 * std_dist  # 2 sigma

    # ── 4. Score each chunk ──
    anomaly_chunks: list[dict] = []
    max_chunk_score = 0

    for i in range(num_chunks):
        chunk_score = 0
        reasons: list[str] = []

        # Rule-based injection
        analysis = threat_detector.analyze(chunks[i])
        if analysis["threat_score"] > 30:
            chunk_score += 50
            reasons.append("injection pattern")

        # Semantic deviation (need 3+ chunks, must exceed both adaptive AND fixed threshold)
        if num_chunks >= 3 and distances[i] > max(adaptive_threshold, SEMANTIC_DEVIATION_THRESHOLD):
            chunk_score += 25
            reasons.append("semantic deviation")

        # IsolationForest anomaly — only flag if also semantically distant
        # Cross-validate: statistical outlier must also deviate semantically
        if iso_labels[i] == -1 and distances[i] > adaptive_threshold:
            chunk_score += 25
            reasons.append("statistical anomaly")

        chunk_score = min(chunk_score, 100)
        max_chunk_score = max(max_chunk_score, chunk_score)

        if reasons:
            anomaly_chunks.append({
                "chunk_index": i,
                "text_preview": chunks[i][:120] + ("..." if len(chunks[i]) > 120 else ""),
                "reason": " | ".join(reasons),
                "score_contribution": chunk_score,
            })

    # ── 5. Document-level risk score ──
    document_risk_score = max_chunk_score

    # ── 6. Threat level ──
    if document_risk_score <= 30:
        threat_level = "Safe"
    elif document_risk_score <= 60:
        threat_level = "Suspicious"
    elif document_risk_score <= 80:
        threat_level = "High"
    else:
        threat_level = "Critical"

    return {
        "document_risk_score": document_risk_score,
        "anomaly_chunks": anomaly_chunks,
        "threat_level": threat_level,
        "total_chunks": num_chunks,
    }
