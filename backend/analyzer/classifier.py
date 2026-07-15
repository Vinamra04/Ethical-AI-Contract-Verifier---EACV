import logging
from fastapi import Request
from .dark_patterns import detect

logger = logging.getLogger(__name__)

RISK_LABELS: dict[int, str] = {0: "Low Risk", 1: "Medium Risk", 2: "High Risk"}

# Patterns that must always produce High Risk regardless of ML prediction.
_HIGH_RISK_PATTERNS: frozenset[str] = frozenset({
    "data_selling",
    "data_sharing",
    "third_party_sharing",
    "indefinite_retention",
    "liability_waiver",
    "device_access",
    "silent_updates",
    "binding_arbitration",
    "broad_surveillance",
})

# Patterns that must produce at least Medium Risk.
_MEDIUM_RISK_PATTERNS: frozenset[str] = frozenset({
    "auto_renewal",
    "forced_consent",
    "unilateral_changes",
})

def classify_clause(clause: str, request: Request) -> dict:
    """Run ML model + dark pattern detection on a single clause.

    Dark pattern overrides take precedence over the ML prediction so that
    known high-risk language is never under-classified.
    """
    vec = request.app.state.vectorizer.transform([clause])
    pred = request.app.state.model.predict(vec)[0]
    risk = RISK_LABELS[int(pred)]
    patterns = detect(clause)

    if any(p in _HIGH_RISK_PATTERNS for p in patterns):
        risk = "High Risk"
    elif any(p in _MEDIUM_RISK_PATTERNS for p in patterns) and risk == "Low Risk":
        risk = "Medium Risk"

    logger.debug("Clause risk=%s patterns=%s text=%.60s", risk, patterns, clause)
    return {"clause": clause, "risk": risk, "dark_patterns": patterns}

def classify_clauses(clauses: list[str], request: Request) -> list[dict]:
    """Classify every clause in the list."""
    return [classify_clause(c, request) for c in clauses]
