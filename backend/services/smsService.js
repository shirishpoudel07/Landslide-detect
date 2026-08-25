const twilio = require('twilio');

// Load Twilio credentials from environment variables (use placeholders for prototype)
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_placeholder_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'placeholder_auth_token';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Initialize Twilio client
// Only initialize if we have actual valid-looking keys (to prevent crashes on placeholder keys)
let client = null;
if (accountSid.startsWith('AC') && authToken.length > 10 && authToken !== 'placeholder_auth_token') {
    try {
        client = twilio(accountSid, authToken);
    } catch (e) {
        console.warn('Twilio client initialization failed. SMS will be simulated.');
    }
} else {
    console.warn('Using placeholder Twilio credentials. SMS will be simulated.');
}

/**
 * Sends a multilingual SMS warning to a list of phone numbers
 * @param {Array<string>} phoneNumbers - Array of recipient phone numbers
 * @param {string} districtName - The name of the district flagged as high risk
 */
const sendHighRiskWarning = async (phoneNumbers, districtName) => {
    // English, Hindi, and a local NER language (e.g., Assamese as an example)
    const messageBody = `
⚠️ URGENT LANDSLIDE WARNING ⚠️
ENG: High landslide risk detected in ${districtName}. Please stay away from steep slopes and remain alert.
HIN: ${districtName} में भूस्खलन का उच्च जोखिम है। कृपया ढलानों से दूर रहें और सतर्क रहें।
ASM: ${districtName}-ত ভূমিস্খলনৰ উচ্চ আশংকা আছে। অনুগ্ৰহ কৰি থিয় ঢালৰ পৰা আঁতৰত থাকক আৰু সতৰ্ক থাকক।
    `.trim();

    console.log(`\n--- INITIATING SMS BROADCAST ---`);
    console.log(`Message Content:\n${messageBody}`);

    for (const number of phoneNumbers) {
        if (client) {
            try {
                const message = await client.messages.create({
                    body: messageBody,
                    from: twilioPhoneNumber,
                    to: number
                });
                console.log(`SMS dispatched to ${number}, SID: ${message.sid}`);
            } catch (error) {
                console.error(`Failed to send SMS to ${number}:`, error.message);
            }
        } else {
            // Simulated SMS sending for prototype without valid credentials
            console.log(`[SIMULATED SMS] Dispatched to ${number}`);
        }
    }
    console.log(`--- SMS BROADCAST COMPLETE ---\n`);
};

module.exports = {
    sendHighRiskWarning
};
