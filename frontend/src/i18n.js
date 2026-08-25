import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      "dashboard_title": "Disaster Management Platform",
      "active_risk_forecasts": "Active Risk Forecasts",
      "loading_risk_zones": "Loading risk zones...",
      "risk_zones": "Risk Zones",
      "no_active_zones": "No active risk zones detected.",
      "high_probability": "High Landslide Probability",
      "medium_probability": "Medium Landslide Probability",
      "low_probability": "Low Landslide Probability",
      "response_priority": "Response Priority",
      "loading_priority": "Loading priority data...",
      "route_blocked": "Route Blocked:",
      "routes_clear": "Routes Clear (No reported blockages)",
      "no_critical_zones": "No critical zones requiring immediate prioritization.",
      "report_incident": "Report Incident (e.g., Blocked Road)",
      "network_online": "Network Online",
      "offline_mode": "Offline Mode Active",
      "describe_incident": "Describe the incident...",
      "low_severity": "Low Severity",
      "medium_severity": "Medium Severity",
      "high_severity": "High Severity",
      "submit_report": "Submit Report",
      "save_offline": "Save Offline"
    }
  },
  hi: {
    translation: {
      "dashboard_title": "आपदा प्रबंधन मंच",
      "active_risk_forecasts": "सक्रिय जोखिम पूर्वानुमान",
      "loading_risk_zones": "जोखिम क्षेत्र लोड हो रहे हैं...",
      "risk_zones": "जोखिम क्षेत्र",
      "no_active_zones": "कोई सक्रिय जोखिम क्षेत्र नहीं मिला।",
      "high_probability": "भूस्खलन की उच्च संभावना",
      "medium_probability": "भूस्खलन की मध्यम संभावना",
      "low_probability": "भूस्खलन की कम संभावना",
      "response_priority": "प्रतिक्रिया प्राथमिकता",
      "loading_priority": "प्राथमिकता डेटा लोड हो रहा है...",
      "route_blocked": "मार्ग अवरुद्ध:",
      "routes_clear": "मार्ग साफ हैं (कोई रुकावट नहीं)",
      "no_critical_zones": "तत्काल प्राथमिकता की आवश्यकता वाले कोई महत्वपूर्ण क्षेत्र नहीं हैं।",
      "report_incident": "घटना की रिपोर्ट करें (उदा. अवरुद्ध सड़क)",
      "network_online": "नेटवर्क ऑनलाइन",
      "offline_mode": "ऑफ़लाइन मोड सक्रिय",
      "describe_incident": "घटना का वर्णन करें...",
      "low_severity": "कम गंभीरता",
      "medium_severity": "मध्यम गंभीरता",
      "high_severity": "उच्च गंभीरता",
      "submit_report": "रिपोर्ट जमा करें",
      "save_offline": "ऑफ़लाइन सहेजें"
    }
  },
  as: {
    translation: {
      "dashboard_title": "বিপর্যয় ব্যৱস্থাপনা মঞ্চ",
      "active_risk_forecasts": "সক্ৰিয় বিপদৰ পূৰ্বাভাস",
      "loading_risk_zones": "বিপদ অঞ্চল লোড কৰা হৈছে...",
      "risk_zones": "বিপদ অঞ্চল",
      "no_active_zones": "কোনো সক্ৰিয় বিপদ অঞ্চল ধৰা পৰা নাই।",
      "high_probability": "ভূমিস্খলনৰ উচ্চ সম্ভাৱনা",
      "medium_probability": "ভূমিস্খলনৰ মধ্যম সম্ভাৱনা",
      "low_probability": "ভূমিস্খলনৰ নিম্ন সম্ভাৱনা",
      "response_priority": "প্ৰতিক্ৰিয়া অগ্ৰাধিকাৰ",
      "loading_priority": "অগ্ৰাধিকাৰ তথ্য লোড কৰা হৈছে...",
      "route_blocked": "পথ অৱৰুদ্ধ:",
      "routes_clear": "পথ পৰিষ্কাৰ (কোনো বাধা নাই)",
      "no_critical_zones": "তাত্ক্ষণিক অগ্ৰাধিকাৰৰ প্ৰয়োজন হোৱা কোনো গুৰুতৰ অঞ্চল নাই।",
      "report_incident": "ঘটনাৰ খবৰ দিয়ক (যেনে, অৱৰুদ্ধ পথ)",
      "network_online": "নেটৱৰ্ক অনলাইন",
      "offline_mode": "অফলাইন মোড সক্ৰিয়",
      "describe_incident": "ঘটনাটোৰ বৰ্ণনা দিয়ক...",
      "low_severity": "নিম্ন গুৰুত্ব",
      "medium_severity": "মধ্যম গুৰুত্ব",
      "high_severity": "উচ্চ গুৰুত্ব",
      "submit_report": "প্ৰতিবেদন দাখিল কৰক",
      "save_offline": "অফলাইন ছেভ কৰক"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
