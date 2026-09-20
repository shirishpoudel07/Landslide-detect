const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateRiskScore, classifyRisk } = require('./riskScoring');

test('high-risk zones are scored as high when rainfall, moisture, and terrain exposure are elevated', () => {
  const riskScore = calculateRiskScore({
    precipitation: 62,
    soilMoisture: 82,
    slopeDegrees: 24,
    elevationRelief: 480,
    name: 'Kathmandu Valley, Nepal'
  });

  assert.equal(classifyRisk(riskScore), 'High');
  assert.ok(riskScore >= 70);
});

test('stable zones remain low risk even with moderate moisture', () => {
  const riskScore = calculateRiskScore({
    precipitation: 8,
    soilMoisture: 22,
    slopeDegrees: 1,
    elevationRelief: 12,
    name: 'Phoenix Metropolitan Region'
  });

  assert.equal(classifyRisk(riskScore), 'Low');
  assert.ok(riskScore < 40);
});

test('flat urban zones should not be classified as landslide-prone unless terrain and rainfall align', () => {
  const riskScore = calculateRiskScore({
    precipitation: 25,
    soilMoisture: 38,
    slopeDegrees: 1,
    elevationRelief: 8,
    name: 'New York, USA'
  });

  assert.equal(classifyRisk(riskScore), 'Low');
  assert.ok(riskScore < 40);
});
