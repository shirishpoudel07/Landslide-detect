import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import axios from 'axios';
import { Activity, Globe } from 'lucide-react';
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
  
  // State for map view
  const [mapCenter, setMapCenter] = useState([20.0, 0.0]);
  const [mapZoom, setMapZoom] = useState(2);

  useEffect(() => {
    const fetchRiskZones = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/risk-zones');
        setRiskZones(response.data.zones || []);
      } catch (error) {
        console.error("Error fetching risk zones:", error);
      }
    };

    fetchRiskZones();
    // Poll every 60 seconds
    const interval = setInterval(fetchRiskZones, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper to determine circle color based on risk level
  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return '#ef4444'; // red-500
      case 'Medium': return '#eab308'; // yellow-500
      case 'Low': return '#22c55e'; // green-500
      default: return '#3b82f6';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>{t('dashboard_title')}</h1>
            <div className="language-toggle" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Globe size={16} color="var(--text-muted)"/>
              <select 
                onChange={(e) => i18n.changeLanguage(e.target.value)} 
                value={i18n.language}
                style={{ background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px', fontSize: '12px' }}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="as">অসমীয়া</option>
              </select>
            </div>
          </div>
          <p>Real-time Landslide Risk Monitoring</p>
        </div>
        
        <div className="sidebar-content">
          <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>
            {t('active_risk_forecasts')}
          </h2>
          
          {riskZones.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('loading_risk_zones')}</p>
          ) : (
            [...riskZones].sort((a, b) => {
              const percA = a.risk_percentage || 0;
              const percB = b.risk_percentage || 0;
              return percB - percA; // Sort descending
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
                style={{ cursor: 'pointer' }}
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
      </div>

      {/* Main Map Area */}
      <div className="map-container">
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {[...riskZones].sort((a, b) => {
            const percA = a.risk_percentage || 0;
            const percB = b.risk_percentage || 0;
            return percA - percB; // Sort ascending so High % is rendered last (on top)
          }).map(zone => {
            // Fixed pixel sizes for CircleMarker regardless of zoom
            let pixelRadius = 5; // Green/Low
            if (zone.risk_level === 'High') pixelRadius = 14; // Red/High
            else if (zone.risk_level === 'Medium') pixelRadius = 9; // Yellow/Medium

            let finalRadius = activeZone === zone.id ? pixelRadius * 1.3 : pixelRadius;

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
                fillOpacity: (zone.risk_level === 'High' || activeZone === zone.id) ? 0.8 : 0.4,
                weight: (zone.risk_level === 'High' || activeZone === zone.id) ? 3 : 2
              }}
              className={(zone.risk_level === 'High' || activeZone === zone.id) ? "pulse-circle high-risk" : "pulse-circle"}
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
      </div>
    </div>
  );
};

export default Dashboard;
