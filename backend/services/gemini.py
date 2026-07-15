import hashlib
import logging
from datetime import datetime, timezone, timedelta

import google.generativeai as genai

from core.config import settings
from .supabase import get_client

logger = logging.getLogger(__name__)

# Bump these when preprocessing or rule logic changes to invalidate stale cache.
PREPROCESSOR_VERSION = "1"
RULES_VERSION = "1"

_genai_configured = False


def _configure_genai() -> None:
    global _genai_configured
    if not _genai_configured:
        genai.configure(api_key=settings.gemini_api_key)
        logger.info("Gemini API configured (key length=%d)", len(settings.gemini_api_key))
        _genai_configured = True


def _make_cache_key(
    risk_level: str,
    issues: list[str],
    dark_patterns: list[str],
    high_clauses: list[str],
) -> str:
    parts = [
        PREPROCESSOR_VERSION,
        RULES_VERSION,
        risk_level,
        "|".join(sorted(issues)),
        "|".join(sorted(dark_patterns)),
        "|".join(sorted(high_clauses[:5])),
    ]
    raw = ":".join(parts).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def _check_cache(cache_key: str) -> str | None:
    now = datetime.now(timezone.utc).isoformat()
    try:
        res = (
            get_client()
            .table("cached_gemini_results")
            .select("explanation")
            .eq("cache_key", cache_key)
            .gt("expires_at", now)
            .maybe_single()
            .execute()
        )
        if res.data:
            logger.info("Gemini cache HIT for key=%s...", cache_key[:12])
            return res.data["explanation"]
    except Exception as e:
        logger.warning("Gemini cache read error: %s", e)

    # Lazily delete expired entry (fire-and-forget)
    try:
        get_client().table("cached_gemini_results").delete().eq("cache_key", cache_key).execute()
    except Exception:
        pass

    return None


def _store_cache(cache_key: str, explanation: str) -> None:
    expires_at = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    try:
        get_client().table("cached_gemini_results").upsert(
            {"cache_key": cache_key, "explanation": explanation, "expires_at": expires_at}
        ).execute()
        logger.info("Gemini explanation cached for key=%s...", cache_key[:12])
    except Exception as e:
        logger.warning("Gemini cache write error (non-fatal): %s", e)


def _fallback_explanation(risk_level: str, issues: list[str]) -> str:
    base = {
        "low": "This document appears relatively safe with few concerning clauses.",
        "medium": "This document contains some concerning clauses worth reviewing carefully.",
        "high": (
            "This document contains multiple high-risk clauses that pose significant "
            "risks to your privacy and rights."
        ),
    }[risk_level]
    if issues:
        top = "; ".join(issues[:3])
        return f"{base} Key concerns: {top}."
    return base


def get_explanation(
    risk_level: str,
    issues: list[str],
    dark_patterns: list[str],
    high_clauses: list[str],
) -> str:
    """
    Generate a human-readable explanation via Gemini.

    Checks cache first. Falls back to a static explanation if the API call fails.
    Gemini output is used ONLY for explanation — it does not affect risk_level.
    """
    cache_key = _make_cache_key(risk_level, issues, dark_patterns, high_clauses)

    cached = _check_cache(cache_key)
    if cached:
        return cached

    try:
        _configure_genai()
        issues_str = ", ".join(issues) if issues else "None"
        patterns_str = ", ".join(dark_patterns) if dark_patterns else "None"
        clauses_str = (
            "\n".join(f"  - {c}" for c in high_clauses[:5])
            if high_clauses
            else "  None"
        )

        prompt = f"""You are a privacy and digital rights expert.

Using ONLY the analysis provided, write a clear and concise explanation (2-3 sentences) of the risks this document poses to the user.

Analysis:
- Risk Level: {risk_level}
- Issues Found: {issues_str}
- Dark Patterns Detected: {patterns_str}
- High Risk Clauses:
{clauses_str}

You must:
- Mention the most important risk types (e.g., data sharing, surveillance, auto-renewal, lack of control)
- Explain the real-world impact on the user

You must NOT:
- Add any new risks not present in the input
- Reclassify the risk level
- Be vague or generic"""

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        explanation = response.text.strip()

        _store_cache(cache_key, explanation)
        return explanation

    except Exception as e:
        logger.error("Gemini API call failed (using fallback): %s", e)
        return _fallback_explanation(risk_level, issues)
