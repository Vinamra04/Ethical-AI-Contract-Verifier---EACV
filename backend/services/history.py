import logging
from .supabase import get_client

logger = logging.getLogger(__name__)


def save_analysis(
    user_id: str,
    input_type: str,
    source_label: str,
    result: dict,
    analysis_id: str,
) -> str:
    """
    Persist an analysis result to Supabase.
    Raises RuntimeError if the write fails (caller gets a 500, not a silent failure).
    """
    try:
        response = get_client().table("analyses").insert({
            "id": analysis_id,
            "user_id": user_id,
            "input_type": input_type,
            "source_label": source_label,
            "risk_level": result["risk_level"],
            "recommendation": result["recommendation"],
            "result_json": result,
        }).execute()

        if not response.data:
            raise RuntimeError("Supabase returned empty data on analyses insert")

        logger.info("Analysis saved: id=%s user=%s", analysis_id, user_id)
        return analysis_id

    except Exception as e:
        logger.error("Failed to save analysis id=%s: %s", analysis_id, e)
        raise RuntimeError(f"Analysis completed but could not be saved: {e}") from e


def list_analyses(user_id: str) -> list[dict]:
    res = (
        get_client().table("analyses")
        .select("id, input_type, source_label, risk_level, recommendation, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


def get_analysis(analysis_id: str, user_id: str) -> dict | None:
    res = (
        get_client().table("analyses")
        .select("*")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    return res.data


def delete_analysis(analysis_id: str, user_id: str) -> bool:
    get_client().table("analyses").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
    return True
