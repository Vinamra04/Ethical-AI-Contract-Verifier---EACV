from fastapi import Request

RISK_LABELS = {0: "Low Risk", 1: "Medium Risk", 2: "High Risk"}

def predict_risk(clause: str, request: Request) -> str:
    vec = request.app.state.vectorizer.transform([clause])
    pred = request.app.state.model.predict(vec)[0]
    return RISK_LABELS[int(pred)]
