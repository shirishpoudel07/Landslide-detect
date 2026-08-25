import React, { useState, useEffect } from 'react';
import { saveIncidentOffline, getOfflineIncidents, deleteIncident } from './db';
import axios from 'axios';
import { Send, CheckCircle, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReportIncident = () => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [status, setStatus] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const syncIncidents = async () => {
      if (navigator.onLine) {
        const pendingIncidents = await getOfflineIncidents();
        for (const incident of pendingIncidents) {
          try {
            await axios.post('http://localhost:3000/api/incidents', incident);
            await deleteIncident(incident.id);
            console.log('Synced incident:', incident.id);
          } catch (error) {
            console.error('Failed to sync incident:', error);
          }
        }
        if (pendingIncidents.length > 0) {
          setStatus('Offline reports synced successfully!');
          setTimeout(() => setStatus(''), 3000);
        }
      }
    };

    const handleOnline = () => {
        setIsOnline(true);
        syncIncidents();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial sync check
    syncIncidents();
    
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mock getting location
    let location = { lat: 26.2, lng: 92.9 }; 
    if ('geolocation' in navigator) {
        try {
            const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
            location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (_err) {
            console.log("Could not get precise location, using default");
        }
    }

    const report = {
      description,
      severity,
      timestamp: new Date().toISOString(),
      location: `POINT(${location.lng} ${location.lat})`,
      image_url: 'mock_image_url.jpg'
    };

    if (navigator.onLine) {
      try {
        await axios.post('http://localhost:3000/api/incidents', report);
        setStatus('Incident reported successfully!');
      } catch (error) {
        console.error('API Error', error);
        await saveIncidentOffline(report);
        setStatus('Saved offline. Will sync when reconnected.');
      }
    } else {
      await saveIncidentOffline(report);
      setStatus('Saved offline. Will sync when reconnected.');
    }

    setDescription('');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="report-form-container">
      <h3>{t('report_incident')}</h3>
      <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? t('network_online') : t('offline_mode')}
      </div>
      <form onSubmit={handleSubmit} className="report-form">
        <textarea 
          placeholder={t('describe_incident')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="Low">{t('low_severity')}</option>
          <option value="Medium">{t('medium_severity')}</option>
          <option value="High">{t('high_severity')}</option>
        </select>
        
        <button type="submit" className="submit-btn">
          <Send size={16} /> {isOnline ? t('submit_report') : t('save_offline')}
        </button>
      </form>
      
      {status && (
        <div className={`status-message ${status.includes('offline') ? 'offline' : 'success'}`}>
          {status.includes('offline') ? <WifiOff size={16} /> : <CheckCircle size={16} />}
          {status}
        </div>
      )}
    </div>
  );
};

export default ReportIncident;
