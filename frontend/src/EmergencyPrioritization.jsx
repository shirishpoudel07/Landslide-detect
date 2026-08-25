import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EmergencyPrioritization = () => {
  const { t } = useTranslation();
  const [highRiskZones, setHighRiskZones] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesRes, incidentsRes] = await Promise.all([
          axios.get('http://localhost:3000/api/risk-zones'),
          axios.get('http://localhost:3000/api/incidents')
        ]);
        
        // Filter only High Risk
        const highRisk = zonesRes.data.zones.filter(z => z.risk_level === 'High');
        setHighRiskZones(highRisk);
        setIncidents(incidentsRes.data.incidents || []);
      } catch (error) {
        console.error("Error fetching prioritization data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="prioritization-panel" style={{ marginTop: '32px' }}>
      <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>
        {t('response_priority')}
      </h2>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('loading_priority')}</p>
      ) : (
        <div className="priority-list">
          {highRiskZones.map((zone, index) => {
            // Find if any incident (blocked road) is near this zone (mock logic)
            const localIncidents = incidents.filter(inc => {
                if (inc.location && inc.location.coordinates) {
                    const [lng, lat] = inc.location.coordinates;
                    // Simple bounding box check approx
                    return Math.abs(lat - zone.lat) < 0.2 && Math.abs(lng - zone.lng) < 0.2;
                }
                return false;
            });

            return (
              <div key={zone.id} className="risk-card High priority-card">
                <div className="risk-card-header">
                  <span className="risk-card-title">#{index + 1} {zone.name}</span>
                  <span className="badge High">CRITICAL</span>
                </div>
                
                <div className="priority-details">
                   <div className="detail-row">
                     <AlertTriangle size={14} color="var(--accent-red)" />
                     <span>{t('high_probability')}</span>
                   </div>
                   
                   {localIncidents.length > 0 ? (
                     <div className="detail-row blocked-route">
                       <Truck size={14} color="var(--accent-yellow)" />
                       <span>{t('route_blocked')} {localIncidents[0].description}</span>
                     </div>
                   ) : (
                     <div className="detail-row clear-route">
                       <Truck size={14} color="#4ade80" />
                       <span>{t('routes_clear')}</span>
                     </div>
                   )}
                </div>
              </div>
            );
          })}
          
          {highRiskZones.length === 0 && (
            <div className="status-message success">
              {t('no_critical_zones')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmergencyPrioritization;
