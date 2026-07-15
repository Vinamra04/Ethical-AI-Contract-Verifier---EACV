import pytest
from preprocessor.clauses import extract_clauses

def test_filters_short_headings():
    text = (
        "Privacy Policy\n\n"
        "We collect your personal data and may sell it to third-party advertisers "
        "without notifying you in advance.\n\n"
        "You agree that by using this service you accept all terms and conditions."
    )
    clauses = extract_clauses(text)
    assert not any(c.strip() == "Privacy Policy" for c in clauses)
    assert len(clauses) >= 2

def test_filters_allcaps_headings():
    text = (
        "TERMS OF SERVICE\n\n"
        "We may share your personal information with third-party partners at any time "
        "without providing prior notice to you.\n\n"
        "You waive your right to participate in any class action lawsuit against us."
    )
    clauses = extract_clauses(text)
    assert not any(c.strip() == "TERMS OF SERVICE" for c in clauses)
    assert len(clauses) >= 2

def test_filters_marketing_content():
    text = (
        "Join millions of happy users today and get started with our amazing platform!\n\n"
        "We may automatically renew your subscription and charge your payment method "
        "without prior notice unless you cancel at least 30 days before renewal.\n\n"
        "By continuing to use the service you consent to binding arbitration."
    )
    clauses = extract_clauses(text)
    assert not any("join millions" in c.lower() for c in clauses)
    assert any("renew" in c.lower() for c in clauses)

def test_merges_broken_lines():
    text = (
        "We may share your information\n"
        "with third-party partners\n"
        "without notice at any time.\n\n"
        "You agree to our updated terms by continuing to use the service."
    )
    clauses = extract_clauses(text)
    merged = " ".join(clauses)
    assert "third-party partners" in merged

def test_fallback_when_too_few_clauses():
    text = "We sell your data. You agree to binding arbitration without right of appeal."
    clauses = extract_clauses(text)
    assert len(clauses) >= 1

def test_numbered_sections_split_correctly():
    text = (
        "1. We collect your name, email address, and usage patterns to improve our services "
        "and may share this data with advertising partners.\n"
        "2. You agree that any disputes will be resolved through binding arbitration and "
        "you waive your right to a jury trial or class action participation.\n"
        "3. We may modify these terms at any time without prior notice and your continued "
        "use of the service constitutes acceptance of the new terms."
    )
    clauses = extract_clauses(text)
    assert len(clauses) >= 3

def test_long_clause_split():
    long_sentence = "We collect data. " * 200  # > 2000 chars
    text = long_sentence
    clauses = extract_clauses(text)
    assert all(len(c) <= 2000 for c in clauses)
