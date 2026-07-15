from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.supabase import get_client

bearer = HTTPBearer()

def get_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    token = credentials.credentials
    res = get_client().auth.get_user(token)
    if not res.user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return res.user.id
