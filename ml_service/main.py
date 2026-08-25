from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="ML Service - Risk Prediction API")

class RiskInput(BaseModel):
    rainfall_mm: float
    soil_moisture_percent: float
    slope_degrees: float

class RiskOutput(BaseModel):
    severity_level: str
    confidence_score: float

@app.get("/health")
def health_check():
    return {"status": "OK"}

@app.post("/predict-risk", response_model=RiskOutput)
def predict_risk(data: RiskInput):
    """
    Placeholder mock AI function that calculates Risk Severity Level
    based on rainfall, soil moisture, and slope.
    """
    # Simple mock logic
    risk_score = (data.rainfall_mm * 0.5) + (data.soil_moisture_percent * 0.3) + (data.slope_degrees * 0.2)
    
    if risk_score > 80:
        severity = "High"
    elif risk_score > 40:
        severity = "Medium"
    else:
        severity = "Low"
        
    return RiskOutput(
        severity_level=severity,
        confidence_score=round(random.uniform(0.7, 0.99), 2)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
