import logging
from .dark_patterns import ISSUE_LABELS

logger = logging.getLogger(__name__)

CRITICAL_PATTERNS: frozenset[str] = frozenset({
    "data_selling",
    "binding_arbitration",
    "broad_surveillance",
    "indefinite_retention",
    # added: patterns the spec explicitly marks as HIGH RISK
    "data_sharing",
    "third_party_sharing",
    "device_access",
    "liability_waiver",
    "silent_updates",
})

_RISK_ORDER = {"High Risk": 0, "Medium Risk": 1, "Low Risk": 2}

def aggregate(clause_results: list[dict]) -> dict:
    """
    Aggregate per-clause results into a final risk verdict.

    Logic:
    - Any critical dark pattern OR >=1 High Risk clause -> overall HIGH
    - >=1 Medium Risk clause -> MEDIUM
    - Otherwise -> LOW
    - Empty input -> LOW (safe default)
    """
    if not clause_results:
        logger.warning("Aggregator: no clause results, defaulting to low risk")
        return _empty_result()

    high_clauses = [c for c in clause_results if c["risk"] == "High Risk"]
    medium_clauses = [c for c in clause_results if c["risk"] == "Medium Risk"]
    all_patterns: set[str] = {p for c in clause_results for p in c.get("dark_patterns", [])}
    has_critical = bool(all_patterns & CRITICAL_PATTERNS)

    if has_critical or len(high_clauses) >= 1:
        risk_level = "high"
    elif len(medium_clauses) >= 1:
        risk_level = "medium"
    else:
        risk_level = "low"

    recommendation = {"high": "risky", "medium": "caution", "low": "safe"}[risk_level]
    highlighted = [c["clause"] for c in high_clauses]
    issues = [ISSUE_LABELS[p] for p in all_patterns if p in ISSUE_LABELS]

    # Prioritize: High Risk clauses first, then Medium, then Low
    sorted_results = sorted(clause_results, key=lambda c: _RISK_ORDER.get(c["risk"], 3))

    logger.info(
        "Aggregator: risk_level=%s high=%d medium=%d patterns=%s",
        risk_level, len(high_clauses), len(medium_clauses), all_patterns,
    )

    return {
        "risk_level": risk_level,
        "recommendation": recommendation,
        "clause_results": sorted_results,
        "dark_patterns_detected": list(all_patterns),
        "highlighted_clauses": highlighted,
        "issues": issues,
        "explanation": "",  # filled in by Gemini service after aggregation
    }

def _empty_result() -> dict:
    return {
        "risk_level": "low",
        "recommendation": "safe",
        "clause_results": [],
        "dark_patterns_detected": [],
        "highlighted_clauses": [],
        "issues": [],
        "explanation": "No analyzable content found in this document.",
    }
