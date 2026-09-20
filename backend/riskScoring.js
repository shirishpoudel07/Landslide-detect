const REGION_RISK_BASE = {
  Nepal: 42,
  Japan: 38,
  Peru: 36,
  Indonesia: 34,
  Philippines: 32,
  Guatemala: 30,
  Ecuador: 28,
  Colombia: 26,
  India: 16,
  default: 4
};

function normalizeRiskScore(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getRegionBaseRisk(name = '') {
  const regionName = String(name);
  const matchedKey = Object.keys(REGION_RISK_BASE).find((key) => regionName.includes(key));
  return matchedKey ? REGION_RISK_BASE[matchedKey] : REGION_RISK_BASE.default;
}

function calculateRiskScore({ precipitation = 0, soilMoisture = 0, slopeDegrees = 15, elevationRelief = 200, name = '' }) {
  const rainfallComponent = Math.min(35, precipitation * 0.55);
  const moistureComponent = Math.min(25, soilMoisture * 0.3);
  const regionBaseRisk = getRegionBaseRisk(name);
  const terrainRelief = Math.max(0, Number(elevationRelief) || 0);
  const slope = Math.max(0, Number(slopeDegrees) || 0);

  // Rain and soil moisture are only meaningful when the local terrain can fail.
  if (slope < 3 && terrainRelief < 40) {
    return normalizeRiskScore(Math.round((rainfallComponent + moistureComponent) * 0.25), 0, 20);
  }

  const terrainFactor = slope < 8 ? 0.45 : slope <= 35 ? 1 : 0.75;
  const reliefComponent = Math.min(15, terrainRelief / 40);
  const totalRisk = (rainfallComponent + moistureComponent + regionBaseRisk + reliefComponent) * terrainFactor;
  return normalizeRiskScore(Math.round(totalRisk), 0, 100);
}

function classifyRisk(riskScore) {
  if (riskScore >= 75) return 'High';
  if (riskScore >= 40) return 'Medium';
  return 'Low';
}

module.exports = {
  calculateRiskScore,
  classifyRisk,
  getRegionBaseRisk
};
