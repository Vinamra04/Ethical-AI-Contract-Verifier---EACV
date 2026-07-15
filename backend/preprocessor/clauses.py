import re
import logging

logger = logging.getLogger(__name__)

PREPROCESSOR_VERSION = "1"

_MARKETING_SIGNALS = [
    # generic marketing
    "join millions", "get started today", "love our", "trusted by",
    "sign up today", "best experience", "download now", "try for free",
    "amazing platform", "happy users",
    # e-commerce / product
    "add to cart", "buy now", "shop now", "free shipping",
    "in stock", "out of stock", "ships within", "ships in",
    "easy returns", "return this item",
    # reviews / testimonials
    "customer review", "verified purchase", "out of 5 stars",
    "write a review", "see all reviews", "helpful vote",
    "top reviews", "most helpful", "star rating", "rated this",
    "people found this helpful",
    # promotions / offers
    "limited time offer", "exclusive deal", "save up to",
    "% off", "discount code", "promo code", "special offer",
    "today only", "flash sale", "subscribe and save",
    # cross-sell / recommendations
    "you may also like", "frequently bought together",
    "customers also viewed", "related products",
    "compare with similar", "sponsored",
    # product descriptions
    "package dimensions", "item weight", "manufacturer",
    "country of origin", "asin", "item model number",
    "best sellers rank",
]
_BOILERPLATE_STARTS = ["©", "all rights reserved", "powered by", "cookie policy"]
_NAV_FRAGMENTS = {
    "home", "menu", "back to top", "sign in", "log in",
    "sign up", "contact us", "about us", "faq",
    "help center", "support", "careers", "press", "blog",
    "privacy policy", "terms of service", "sitemap",
}

def _is_junk(para: str) -> bool:
    p = para.strip()
    if len(p) < 40:
        return True
    if p == p.upper() and len(p) < 150:
        return True
    lower = p.lower()
    if any(sig in lower for sig in _MARKETING_SIGNALS):
        return True
    if any(lower.startswith(bp) for bp in _BOILERPLATE_STARTS):
        return True
    if lower.strip(".,:;!?") in _NAV_FRAGMENTS:
        return True
    return False

def _merge_broken_lines(para: str) -> str:
    """Merge soft-wrapped lines within a paragraph into a single string."""
    lines = [ln.strip() for ln in para.splitlines() if ln.strip()]
    return " ".join(lines)

def _split_long_clause(clause: str, max_len: int = 2000) -> list[str]:
    if len(clause) <= max_len:
        return [clause]
    sentences = re.split(r'(?<=[.!?])\s+', clause)
    chunks: list[str] = []
    current = ""
    for s in sentences:
        if len(current) + len(s) + 1 <= max_len:
            current = (current + " " + s).strip()
        else:
            if current:
                chunks.append(current)
            current = s
    if current:
        chunks.append(current)
    return chunks if chunks else [clause[:max_len]]

def extract_clauses(text: str) -> list[str]:
    """
    Split a T&C document into clean, meaningful policy clauses.
    Filters junk (headings, marketing, nav), merges broken lines,
    enforces length gates, and falls back to sentence splitting if
    fewer than 2 clauses survive.
    """
    # Step 1: split into paragraphs on double newlines or numbered markers
    raw_paras = re.split(r'\n{2,}|(?=\n\s*\d+\.\s)|(?=\n\s*[a-z]\.\s)', text)

    # Step 2: filter junk paragraphs
    clean_paras = [p.strip() for p in raw_paras if p.strip() and not _is_junk(p.strip())]

    # Step 3: merge broken lines within each paragraph
    merged = [_merge_broken_lines(p) for p in clean_paras]
    merged = [m for m in merged if m]

    # Step 4: length gate + split long clauses
    clauses: list[str] = []
    for m in merged:
        if 40 <= len(m) <= 2000:
            clauses.append(m)
        elif len(m) > 2000:
            clauses.extend(_split_long_clause(m))

    # Step 5: fallback if fewer than 2 clauses survived
    if len(clauses) < 2:
        logger.warning(
            "Preprocessor: fewer than 2 clauses after filtering (%d), "
            "using sentence-boundary fallback",
            len(clauses),
        )
        sentences = re.split(r'(?<=[.!?])\s+', text)
        clauses = [s.strip() for s in sentences if len(s.strip()) >= 40]

    logger.info("Preprocessor: extracted %d clauses", len(clauses))
    return clauses
