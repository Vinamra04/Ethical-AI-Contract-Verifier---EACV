from extractors.text import split_into_clauses, extract as text_extract
from extractors.pdf import extract as pdf_extract
import pytest

def test_split_into_clauses_basic():
    text = "We may share your data with third parties. You have the right to opt out of data sharing."
    clauses = split_into_clauses(text)
    assert len(clauses) == 2
    assert "We may share your data" in clauses[0]

def test_split_filters_short():
    text = "Hi. We may share your data with third parties for advertising purposes."
    clauses = split_into_clauses(text)
    assert all(len(c) > 30 for c in clauses)

def test_text_extract_strips():
    assert text_extract("  hello world  ") == "hello world"

def test_pdf_extract_bytes():
    # minimal valid PDF
    import io
    import pdfplumber
    # use a real simple in-memory test: if pdfplumber raises, we catch it
    with pytest.raises(Exception):
        pdf_extract(b"not a pdf")
