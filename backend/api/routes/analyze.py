import logging
from fastapi import APIRouter, Request, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from uuid import uuid4

from extractors import text as text_extractor
from extractors import pdf as pdf_extractor
from extractors import url as url_extractor
from extractors import ocr as ocr_extractor
from preprocessor.clauses import extract_clauses
from analyzer.classifier import classify_clauses
from analyzer.aggregator import aggregate
from services.gemini import get_explanation
from services.history import save_analysis
from api.deps import get_user_id

logger = logging.getLogger(__name__)

router = APIRouter()


class TextInput(BaseModel):
    text: str


class URLInput(BaseModel):
    url: str


def run_analysis(
    raw_text: str,
    input_type: str,
    source_label: str,
    user_id: str,
    request: Request,
) -> dict:
    # 1. Extract clauses
    clauses = extract_clauses(raw_text)
    if not clauses:
        raise HTTPException(status_code=422, detail="No analyzable content extracted.")

    logger.info("Analysis started: input_type=%s clauses=%d", input_type, len(clauses))

    # 2. Classify clauses (ML model + dark patterns)
    clause_results = classify_clauses(clauses, request)

    # 3. Aggregate into final verdict
    result = aggregate(clause_results)

    # 4. Generate Gemini explanation (last step — cannot affect risk_level)
    result["explanation"] = get_explanation(
        risk_level=result["risk_level"],
        issues=result["issues"],
        dark_patterns=result["dark_patterns_detected"],
        high_clauses=result["highlighted_clauses"],
    )

    # 5. Save to Supabase
    analysis_id = str(uuid4())
    result["id"] = analysis_id
    save_analysis(user_id, input_type, source_label, result, analysis_id)

    logger.info(
        "Analysis complete: id=%s risk_level=%s",
        analysis_id, result["risk_level"],
    )
    return result


@router.post("/text")
def analyze_text(body: TextInput, request: Request, user_id: str = Depends(get_user_id)):
    raw = text_extractor.extract(body.text)
    return run_analysis(raw, "text", "Pasted text", user_id, request)


@router.post("/url")
def analyze_url(body: URLInput, request: Request, user_id: str = Depends(get_user_id)):
    try:
        raw = url_extractor.extract(body.url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return run_analysis(raw, "url", body.url, user_id, request)


@router.post("/file")
async def analyze_file(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(get_user_id),
):
    data = await file.read()
    try:
        raw = pdf_extractor.extract(data)
    except Exception:
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")
    return run_analysis(
        raw, "file", file.filename or "uploaded_file.pdf", user_id, request
    )


@router.post("/image")
async def analyze_image(
    request: Request,
    image: UploadFile = File(...),
    user_id: str = Depends(get_user_id),
):
    data = await image.read()
    try:
        raw = ocr_extractor.extract(data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return run_analysis(
        raw, "image", image.filename or "uploaded_image", user_id, request
    )
