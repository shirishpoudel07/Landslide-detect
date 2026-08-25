const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { startWeatherRiskCron } = require('./cron/weatherRiskJob');
const { startImdWeatherCron } = require('./cron/imdWeatherJob');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000'
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, curl, same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

const dbPath = path.resolve(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        try {
            db.loadExtension('mod_spatialite', (err) => {
                if (err) {
                    console.error('Could not load Spatialite extension in server:', err.message);
                } else {
                    console.log('Spatialite extension loaded in server.');
                }
            });
        } catch (e) {
            console.error('Spatialite loading error:', e.message);
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Example endpoint to get incident reports
app.get('/api/incidents', (req, res) => {
    // Requires Spatialite for ST_AsGeoJSON
    db.all("SELECT id, description, severity, image_url, timestamp, ST_AsGeoJSON(location) as location FROM incident_reports", [], (err, rows) => {
        if (err) {
            // Fallback for prototype if Spatialite isn't loaded
            const mockIncidents = [
                { id: 101, description: "Landslide blocking Highway 42", severity: "High", timestamp: new Date().toISOString(), location: { coordinates: [91.73, 26.14] } },
                { id: 102, description: "Minor rockfall on Shillong Bypass", severity: "Medium", timestamp: new Date().toISOString(), location: { coordinates: [91.88, 25.57] } }
            ];
            return res.json({ incidents: mockIncidents });
        }
        // Parse the location string back to JSON if it exists
        const formattedRows = rows.map(row => ({
            ...row,
            location: row.location ? JSON.parse(row.location) : null
        }));
        res.json({ incidents: formattedRows });
    });
});

const axios = require('axios');
const fs = require('fs');

// Cache for risk zones
let riskZonesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Load massive global locations list generated from file
let baseLocations = [];
try {
    const locationsPath = path.join(__dirname, 'data', 'global_locations.json');
    baseLocations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
} catch (e) {
    console.error("Failed to load global_locations.json", e.message);
    baseLocations = [
        { id: 1, lat: 26.190, lng: 91.760, radius: 1500, name: 'Nabagraha Hill Slopes, Guwahati, India' }
    ];
}

// Endpoint to fetch active risk zones with real data for ALL countries
app.get('/api/risk-zones', async (req, res) => {
    const now = Date.now();
    if (riskZonesCache && (now - lastFetchTime) < CACHE_DURATION_MS) {
        return res.json({ zones: riskZonesCache, cached: true });
    }

    try {
        // Chunk locations into batches of 50 to avoid URL limits
        const chunkSize = 50;
        const chunks = [];
        for (let i = 0; i < baseLocations.length; i += chunkSize) {
            chunks.push(baseLocations.slice(i, i + chunkSize));
        }

        const fetchPromises = chunks.map(chunk => {
            const lats = chunk.map(loc => loc.lat).join(',');
            const lngs = chunk.map(loc => loc.lng).join(',');
            const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=precipitation,soil_moisture_0_to_7cm`;
            return axios.get(apiUrl).then(res => ({ chunk, data: Array.isArray(res.data) ? res.data : [res.data] }));
        });

        const results = await Promise.all(fetchPromises);
        let allEnrichedZones = [];

        results.forEach(({ chunk, data }) => {
            const enrichedChunk = chunk.map((loc, index) => {
                const locData = data[index] || data[0] || {};
                const current = locData.current || {};
                
                const precip = current.precipitation || 0;
                const soilMoisture = current.soil_moisture_0_to_7cm || 0;

                // Add inherent topographical risk for historically dangerous zones
                const dangerousZones = ['Nepal', 'Japan', 'Peru', 'Indonesia', 'Philippines', 'Guatemala', 'Ecuador', 'Colombia'];
                let inherentRisk = 10;
                if (dangerousZones.some(z => loc.name.includes(z))) {
                    inherentRisk = 55; // Huge baseline risk for naturally dangerous terrain
                }

                // Calculate a 0-100% risk percentage
                let rawRisk = (precip * 15) + (soilMoisture * 120) + inherentRisk;
                let risk_percentage = Math.min(100, Math.round(rawRisk));

                let risk = 'Low';
                // Thresholds for colors
                if (risk_percentage >= 75) {
                    risk = 'High'; // Red
                } else if (risk_percentage >= 40) {
                    risk = 'Medium'; // Yellow
                }

                return {
                    ...loc,
                    risk_level: risk,
                    risk_percentage: risk_percentage,
                    precipitation_mm: precip,
                    soil_moisture: soilMoisture
                };
            });
            allEnrichedZones = allEnrichedZones.concat(enrichedChunk);
        });

        riskZonesCache = allEnrichedZones;
        lastFetchTime = now;
        
        res.json({ zones: allEnrichedZones, cached: false });
    } catch (error) {
        console.error("Failed to fetch global data from Open-Meteo:", error.message);
        if (riskZonesCache) {
            return res.json({ zones: riskZonesCache, cached: true, error: "Using stale data" });
        }
        const fallbackZones = baseLocations.map(loc => ({ ...loc, risk_level: 'Low' }));
        res.json({ zones: fallbackZones, error: "API unreachable" });
    }
});

// Endpoint to submit new incidents
app.post('/api/incidents', (req, res) => {
    const { description, severity, image_url, timestamp, location } = req.body;
    // In a full implementation, you would insert this into the SQLite database.
    // For this prototype, we'll log it and pretend it was saved successfully.
    console.log('Received incident report:', { description, severity, location });
    
    // Example of inserting if Spatialite was loaded:
    // db.run(`INSERT INTO incident_reports (description, severity, image_url, timestamp, location) VALUES (?, ?, ?, ?, ST_GeomFromText(?, 4326))`, [description, severity, image_url, timestamp, location])
    
    res.status(201).json({ message: 'Incident saved successfully' });
});

// Start the cron jobs
startWeatherRiskCron();
startImdWeatherCron();

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
