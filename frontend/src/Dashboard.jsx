import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import axios from 'axios';
import { Activity, Globe, Moon, Sun } from 'lucide-react';
import ReportIncident from './ReportIncident';
import EmergencyPrioritization from './EmergencyPrioritization';
import { useTranslation } from 'react-i18next';

// Component to dynamically update map center/zoom
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    // Increased duration for much smoother, cinematic flying across the globe
    map.flyTo(center, zoom, { duration: 2.5, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [riskZones, setRiskZones] = useState([]);
  const [activeZone, setActiveZone] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('cmr-theme') === 'dark';
  });

  // State for map view
  const [mapCenter, setMapCenter] = useState([20.0, 0.0]);
  const [mapZoom, setMapZoom] = useState(2);

  useEffect(() => {
    const fetchRiskZones = async () => {
      setIsRefreshing(true);
      try {
        const response = await axios.get('http://localhost:3000/api/risk-zones');
        setRiskZones(response.data.zones || []);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching risk zones:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchRiskZones();
    const interval = setInterval(fetchRiskZones, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper to determine circle color based on risk level
  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return '#ef4444';
      case 'Medium': return '#fbbf24';
      case 'Low': return '#34d399';
      default: return '#60a5fa';
    }
  };

  const activeRiskCount = riskZones.filter((zone) => zone.risk_level === 'High').length;
  const mediumRiskCount = riskZones.filter((zone) => zone.risk_level === 'Medium').length;
  const safeZoneCount = riskZones.filter((zone) => zone.risk_level === 'Low').length;
  const formattedUpdatedAt = lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('cmr-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <aside className="sidebar">
        <header className="sidebar-header">
          <div className="header-top">
            <div>
              <p className="eyebrow">Regional monitoring</p>
              <h1>{t('dashboard_title')}</h1>
            </div>
            <div className="language-toggle">
              <Globe size={16} color="var(--text-muted)" />
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                value={i18n.language}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="as">অসমীয়া</option>
              </select>
              <button
                type="button"
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => setIsDarkMode((current) => !current)}
              >
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>

          <div className="header-meta">
            <span className={`status-pill ${isRefreshing ? 'refreshing' : ''}`}>
              <span className="status-dot" /> {isRefreshing ? 'Refreshing' : 'Live feed'}
            </span>
            <span className="last-updated">Updated {formattedUpdatedAt}</span>
          </div>
        </header>

        <div className="sidebar-content">
          <div className="dashboard-summary">
            <div className="summary-card danger">
              <span className="summary-label">Critical</span>
              <strong className="summary-value">{activeRiskCount}</strong>
            </div>
            <div className="summary-card warning">
              <span className="summary-label">Watch</span>
              <strong className="summary-value">{mediumRiskCount}</strong>
            </div>
            <div className="summary-card success">
              <span className="summary-label">Stable</span>
              <strong className="summary-value">{safeZoneCount}</strong>
            </div>
          </div>

          <div className="section-header">
            <h2>{t('active_risk_forecasts')}</h2>
            <span className="zone-count">{riskZones.length}</span>
          </div>

          {riskZones.length === 0 ? (
            <p className="empty-state">{t('loading_risk_zones')}</p>
          ) : (
            [...riskZones].sort((a, b) => {
              const percA = a.risk_percentage || 0;
              const percB = b.risk_percentage || 0;
              return percB - percA;
            }).map((zone) => (
              <div
                key={zone.id}
                className={`risk-card ${zone.risk_level} ${activeZone === zone.id ? 'active' : ''}`}
                onMouseEnter={() => setActiveZone(zone.id)}
                onMouseLeave={() => setActiveZone(null)}
                onClick={() => {
                  setMapCenter([zone.lat, zone.lng]);
                  setMapZoom(9);
                }}
              >
                <div className="risk-card-header">
                  <span className="risk-card-title">{zone.name}</span>
                  <span className={`badge ${zone.risk_level}`}>{zone.risk_percentage || 0}% Risk</span>
                </div>
                <div className="risk-card-details">
                  <div className="detail-row">
                    <Activity size={14} color="var(--text-muted)" />
                    <span>{zone.risk_level === 'High' ? t('high_probability') : zone.risk_level === 'Medium' ? t('medium_probability') : t('low_probability')}</span>
                  </div>
                </div>
              </div>
            ))
          )}

          <EmergencyPrioritization />
          <ReportIncident />
        </div>
      </aside>

      <main className="map-container">
        <div className="map-toolbar">
          <span className="toolbar-label">Situational overview</span>
          <span className="toolbar-value">
            {activeZone ? 'Zone focus enabled' : 'Global network'}
          </span>
        </div>

        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {[...riskZones].sort((a, b) => {
            const percA = a.risk_percentage || 0;
            const percB = b.risk_percentage || 0;
            return percA - percB;
          }).map(zone => {
            let pixelRadius = 5;
            if (zone.risk_level === 'High') pixelRadius = 14;
            else if (zone.risk_level === 'Medium') pixelRadius = 9;

            const finalRadius = activeZone === zone.id ? pixelRadius * 1.3 : pixelRadius;
            const isFocusZone = activeZone === zone.id;

            return (
              <CircleMarker
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={finalRadius}
                eventHandlers={{
                  mouseover: () => setActiveZone(zone.id),
                  mouseout: () => setActiveZone(null),
                  click: () => {
                    setMapCenter([zone.lat, zone.lng]);
                    setMapZoom(9);
                  }
                }}
                pathOptions={{
                  color: getRiskColor(zone.risk_level),
                  fillColor: getRiskColor(zone.risk_level),
                  fillOpacity: isFocusZone ? 0.9 : zone.risk_level === 'High' ? 0.75 : 0.42,
                  weight: isFocusZone ? 3.5 : zone.risk_level === 'High' ? 2.8 : 2,
                  opacity: isFocusZone ? 1 : 0.85,
                }}
                className={isFocusZone ? "pulse-circle high-risk ring-focus" : zone.risk_level === 'High' ? "pulse-circle high-risk" : "pulse-circle"}
              >
                <Tooltip className="glass-tooltip" sticky direction="top">
                  <div className="tooltip-content">
                    <strong>{zone.name}</strong>
                    <div className="tooltip-risk">
                      Risk Level: <span className={`badge ${zone.risk_level}`}>{zone.risk_percentage || 0}% ({zone.risk_level})</span>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </main>
    </div>
  );
};

export default Dashboard;
