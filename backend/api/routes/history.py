from fastapi import APIRouter, Depends, HTTPException
from services.history import list_analyses, get_analysis, delete_analysis
from api.deps import get_user_id

router = APIRouter()

@router.get("")
def list_history(user_id: str = Depends(get_user_id)):
    return list_analyses(user_id)

@router.get("/{analysis_id}")
def get_history_item(analysis_id: str, user_id: str = Depends(get_user_id)):
    item = get_analysis(analysis_id, user_id)
    if not item:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return item

@router.delete("/{analysis_id}")
def delete_history_item(analysis_id: str, user_id: str = Depends(get_user_id)):
    delete_analysis(analysis_id, user_id)
    return {"deleted": True}
