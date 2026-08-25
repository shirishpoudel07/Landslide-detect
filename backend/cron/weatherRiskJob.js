const cron = require('node-cron');
const axios = require('axios');
const { sendHighRiskWarning } = require('../services/smsService');

// Mock list of registered citizens' phone numbers
const registeredCitizens = [
    '+919876543210',
    '+919123456789'
];

// Configure the cron job to run every 5 minutes
const startWeatherRiskCron = () => {
    console.log('Initializing weather risk cron job...');
    
    cron.schedule('*/5 * * * *', async () => {
        console.log(`[${new Date().toISOString()}] Running weather risk prediction job...`);
        
        try {
            // In a real application, you would fetch actual weather data for various locations
            // Here we generate mock input data
            const mockData = {
                rainfall_mm: Math.random() * 150, // 0 to 150 mm
                soil_moisture_percent: Math.random() * 100, // 0 to 100%
                slope_degrees: Math.random() * 60 // 0 to 60 degrees
            };

            const mockDistrict = "Guwahati Hills"; // Hardcoded for prototype

            console.log(`Sending data to ML service for ${mockDistrict}:`, mockData);

            const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
            
            const response = await axios.post(`${mlServiceUrl}/predict-risk`, mockData);
            const prediction = response.data;
            
            console.log('Received risk prediction from ML service:', prediction);
            
            // Trigger SMS if High Risk
            if (prediction.severity_level === 'High') {
                console.log(`[ALERT] High Risk detected in ${mockDistrict}. Triggering automated SMS warnings...`);
                await sendHighRiskWarning(registeredCitizens, mockDistrict);
            }
            
            // Here you would typically save the prediction to your database 
            // e.g. updating the risk_zones table or logging to a risk history table
            
        } catch (error) {
            console.error('Error in weather risk cron job:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
        }
    });
};

module.exports = { startWeatherRiskCron };
