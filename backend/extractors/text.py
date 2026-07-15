import re

def split_into_clauses(text: str) -> list[str]:
    parts = re.split(r'[.!?;\n]+', text)
    return [p.strip() for p in parts if len(p.strip()) > 30]

def extract(raw_text: str) -> str:
    return raw_text.strip()
