from analyzer.dark_patterns import detect
from analyzer.aggregator import aggregate

def test_detect_data_selling():
    result = detect("We may sell your data to advertising partners.")
    assert "data_selling" in result

def test_detect_no_patterns():
    result = detect("You may delete your account at any time.")
    assert result == []

def test_detect_multiple():
    result = detect("We share with third-party partners and automatic renewal applies.")
    assert "third_party_sharing" in result
    assert "auto_renewal" in result

def test_aggregate_high_risk():
    clauses = [
        {"clause": "We sell your data.", "risk": "High Risk", "dark_patterns": ["data_selling"]},
        {"clause": "We sell your data.", "risk": "High Risk", "dark_patterns": []},
    ]
    result = aggregate(clauses)
    assert result["risk_level"] == "high"
    assert result["recommendation"] == "risky"
    assert "risk_score" not in result

def test_aggregate_low_risk():
    clauses = [
        {"clause": "You can delete your account.", "risk": "Low Risk", "dark_patterns": []},
        {"clause": "You control your data.", "risk": "Low Risk", "dark_patterns": []},
    ]
    result = aggregate(clauses)
    assert result["risk_level"] == "low"
    assert result["recommendation"] == "safe"

def test_aggregate_empty():
    result = aggregate([])
    assert "risk_score" not in result
    assert result["risk_level"] == "low"
