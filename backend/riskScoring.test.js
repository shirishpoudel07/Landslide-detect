const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateRiskScore, classifyRisk } = require('./riskScoring');

test('high-risk zones are scored as high when rainfall, moisture, and terrain exposure are elevated', () => {
  const riskScore = calculateRiskScore({
    precipitation: 62,
    soilMoisture: 82,
    lat: 27.9,
    lng: 85.3,
    name: 'Kathmandu Valley, Nepal'
  });

  assert.equal(classifyRisk(riskScore), 'High');
  assert.ok(riskScore >= 70);
});

test('stable zones remain low risk even with moderate moisture', () => {
  const riskScore = calculateRiskScore({
    precipitation: 8,
    soilMoisture: 22,
    lat: 33.5,
    lng: -112.1,
    name: 'Phoenix Metropolitan Region'
  });

  assert.equal(classifyRisk(riskScore), 'Low');
  assert.ok(riskScore < 40);
});
