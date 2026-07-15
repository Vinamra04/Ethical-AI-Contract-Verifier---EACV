from .supabase import get_client

BUCKET = "user-uploads"

def upload_file(user_id: str, analysis_id: str, filename: str, data: bytes, content_type: str) -> str:
    path = f"{user_id}/{analysis_id}/{filename}"
    get_client().storage.from_(BUCKET).upload(path, data, {"content-type": content_type})
    return path

def delete_file(path: str) -> None:
    get_client().storage.from_(BUCKET).remove([path])
