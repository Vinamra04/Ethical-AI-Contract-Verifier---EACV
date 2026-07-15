from analyzer.aggregator import aggregate

def _make_result(risk: str, patterns: list[str]) -> dict:
    return {"clause": "test clause", "risk": risk, "dark_patterns": patterns}

def test_two_high_clauses_gives_high():
    results = [
        _make_result("High Risk", []),
        _make_result("High Risk", []),
        _make_result("Low Risk", []),
    ]
    out = aggregate(results)
    assert out["risk_level"] == "high"
    assert out["recommendation"] == "risky"

def test_one_high_gives_medium():
    results = [
        _make_result("High Risk", []),
        _make_result("Low Risk", []),
        _make_result("Low Risk", []),
    ]
    out = aggregate(results)
    assert out["risk_level"] == "medium"

def test_three_medium_gives_medium():
    results = [_make_result("Medium Risk", []) for _ in range(3)]
    out = aggregate(results)
    assert out["risk_level"] == "medium"

def test_critical_pattern_forces_high():
    results = [
        _make_result("Low Risk", ["data_selling"]),
        _make_result("Low Risk", []),
    ]
    out = aggregate(results)
    assert out["risk_level"] == "high"
    assert "data_selling" in out["dark_patterns_detected"]

def test_all_low_gives_low():
    results = [_make_result("Low Risk", []) for _ in range(5)]
    out = aggregate(results)
    assert out["risk_level"] == "low"
    assert out["recommendation"] == "safe"

def test_empty_input_defaults_to_low():
    out = aggregate([])
    assert out["risk_level"] == "low"
    assert out["recommendation"] == "safe"

def test_no_risk_score_in_output():
    results = [_make_result("High Risk", [])]
    out = aggregate(results)
    assert "risk_score" not in out

def test_highlighted_clauses_are_high_risk_only():
    results = [
        _make_result("High Risk", []),
        _make_result("Medium Risk", []),
        _make_result("High Risk", []),
    ]
    out = aggregate(results)
    assert len(out["highlighted_clauses"]) == 2

def test_issues_list_populated_from_patterns():
    results = [_make_result("High Risk", ["auto_renewal", "binding_arbitration"])]
    out = aggregate(results)
    assert len(out["issues"]) == 2
