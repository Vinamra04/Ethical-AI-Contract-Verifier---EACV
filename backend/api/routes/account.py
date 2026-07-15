import logging
from fastapi import APIRouter, Depends, Response, HTTPException
from services.supabase import get_client
from api.deps import get_user_id

logger = logging.getLogger(__name__)
router = APIRouter()


@router.delete("")
def delete_account(user_id: str = Depends(get_user_id)):
    """Delete all analyses for the user, then delete the Supabase auth user."""
    client = get_client()
    try:
        client.table("analyses").delete().eq("user_id", user_id).execute()
        logger.info("Deleted all analyses for user=%s", user_id)
    except Exception as e:
        logger.error("Failed to delete analyses for user=%s: %s", user_id, e)
        raise HTTPException(status_code=500, detail="Failed to delete user data")

    try:
        client.auth.admin.delete_user(user_id)
        logger.info("Deleted auth user=%s", user_id)
    except Exception as e:
        logger.error("Failed to delete auth user=%s: %s", user_id, e)
        raise HTTPException(status_code=500, detail="Failed to delete account")

    return Response(status_code=204)
