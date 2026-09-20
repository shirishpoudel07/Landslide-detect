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

function calculateRiskScore({ precipitation = 0, soilMoisture = 0, lat = 0, lng = 0, name = '' }) {
  const rainfallComponent = precipitation * 0.35;
  const moistureComponent = soilMoisture * 0.35;
  const latitudeComponent = Math.abs(lat) > 30 ? 10 : 4;
  const longitudeComponent = Math.abs(lng) > 90 ? 10 : 3;
  const regionBaseRisk = getRegionBaseRisk(name);

  const totalRisk = rainfallComponent + moistureComponent + latitudeComponent + longitudeComponent + regionBaseRisk;
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
