const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  // Load spatialite extension
  try {
    // Note: on Windows this requires mod_spatialite.dll to be in the PATH or same directory
    // For Linux it usually is 'mod_spatialite.so' or 'libspatialite.so'
    db.loadExtension('mod_spatialite', (err) => {
        if (err) {
            console.error('Could not load Spatialite extension. Ensure mod_spatialite is installed and accessible in the system path.', err.message);
            // We don't exit here, so the rest of the script can run and fail gracefully if spatial features are used without the extension, or so the user can see the issue.
        } else {
            console.log('Spatialite extension loaded successfully.');
            // Initialize spatial metadata
            db.run(`SELECT InitSpatialMetaData(1);`, (err) => {
                if(err) console.log('SpatialMetaData may already be initialized.');
            });
        }
    });
  } catch (e) {
    console.error('Error during Spatialite loadExtension:', e.message);
  }

  // Create weather_logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS weather_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      temperature REAL,
      humidity REAL,
      rainfall REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add geometry column for weather_logs if Spatialite loaded
  db.run(`SELECT AddGeometryColumn('weather_logs', 'location', 4326, 'POINT', 'XY');`, (err) => {
      // Ignore error if column already exists
  });

  // Create incident_reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS incident_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT,
      severity TEXT,
      image_url TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add geometry column for incident_reports
  db.run(`SELECT AddGeometryColumn('incident_reports', 'location', 4326, 'POINT', 'XY');`, (err) => {});


  // Create risk_zones table
  db.run(`
    CREATE TABLE IF NOT EXISTS risk_zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      risk_level TEXT,
      description TEXT
    )
  `);
  
  // Add geometry column for risk_zones
  db.run(`SELECT AddGeometryColumn('risk_zones', 'boundary', 4326, 'POLYGON', 'XY');`, (err) => {});

  console.log('Database tables initialized.');
});

db.close();
