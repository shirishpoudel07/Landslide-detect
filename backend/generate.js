const fs = require('fs');
const path = require('path');

const regions = [
    // North America
    {lat: 47.60, lng: -122.33, name: "Seattle Area, USA"}, {lat: 45.52, lng: -122.67, name: "Portland, USA"}, {lat: 40.71, lng: -74.00, name: "New York, USA"}, {lat: 39.73, lng: -104.99, name: "Denver, USA"}, {lat: 25.76, lng: -80.19, name: "Miami, USA"}, {lat: 51.04, lng: -114.07, name: "Calgary, Canada"}, {lat: 49.28, lng: -123.12, name: "Vancouver, Canada"}, {lat: 19.43, lng: -99.13, name: "Mexico City, Mexico"}, {lat: 14.63, lng: -90.51, name: "Guatemala City, Guatemala"},
    // South America
    {lat: -4.71, lng: -74.07, name: "Bogota, Colombia"}, {lat: -0.22, lng: -78.50, name: "Quito, Ecuador"}, {lat: -12.04, lng: -77.04, name: "Lima, Peru"}, {lat: -16.50, lng: -68.11, name: "La Paz, Bolivia"}, {lat: -33.44, lng: -70.66, name: "Santiago, Chile"}, {lat: -34.60, lng: -58.38, name: "Buenos Aires, Argentina"}, {lat: -23.55, lng: -46.63, name: "Sao Paulo, Brazil"}, {lat: 10.48, lng: -66.90, name: "Caracas, Venezuela"},
    // Europe
    {lat: 51.50, lng: -0.12, name: "London, UK"}, {lat: 55.95, lng: -3.18, name: "Edinburgh, UK"}, {lat: 48.85, lng: 2.35, name: "Paris, France"}, {lat: 43.29, lng: 5.36, name: "Marseille, France"}, {lat: 40.41, lng: -3.70, name: "Madrid, Spain"}, {lat: 41.38, lng: 2.16, name: "Barcelona, Spain"}, {lat: 41.90, lng: 12.49, name: "Rome, Italy"}, {lat: 45.46, lng: 9.19, name: "Milan, Italy"}, {lat: 47.37, lng: 8.54, name: "Zurich, Switzerland"}, {lat: 48.20, lng: 16.37, name: "Vienna, Austria"}, {lat: 52.52, lng: 13.40, name: "Berlin, Germany"}, {lat: 48.13, lng: 11.58, name: "Munich, Germany"}, {lat: 52.36, lng: 4.90, name: "Amsterdam, Netherlands"}, {lat: 59.32, lng: 18.06, name: "Stockholm, Sweden"}, {lat: 59.91, lng: 10.75, name: "Oslo, Norway"}, {lat: 55.67, lng: 12.56, name: "Copenhagen, Denmark"}, {lat: 60.16, lng: 24.93, name: "Helsinki, Finland"}, {lat: 55.75, lng: 37.61, name: "Moscow, Russia"}, {lat: 50.45, lng: 30.52, name: "Kyiv, Ukraine"},
    // Africa
    {lat: 30.04, lng: 31.23, name: "Cairo, Egypt"}, {lat: -33.92, lng: 18.42, name: "Cape Town, South Africa"}, {lat: -26.20, lng: 28.04, name: "Johannesburg, South Africa"}, {lat: -1.29, lng: 36.82, name: "Nairobi, Kenya"}, {lat: 9.02, lng: 38.74, name: "Addis Ababa, Ethiopia"}, {lat: 6.52, lng: 3.37, name: "Lagos, Nigeria"}, {lat: 5.60, lng: -0.18, name: "Accra, Ghana"}, {lat: 14.69, lng: -17.44, name: "Dakar, Senegal"}, {lat: 34.02, lng: -6.83, name: "Rabat, Morocco"}, {lat: 36.80, lng: 10.18, name: "Tunis, Tunisia"},
    // Asia
    {lat: 39.90, lng: 116.40, name: "Beijing, China"}, {lat: 31.23, lng: 121.47, name: "Shanghai, China"}, {lat: 30.57, lng: 104.06, name: "Chengdu, China"}, {lat: 35.67, lng: 139.65, name: "Tokyo, Japan"}, {lat: 34.69, lng: 135.50, name: "Osaka, Japan"}, {lat: 37.56, lng: 126.97, name: "Seoul, South Korea"}, {lat: 25.03, lng: 121.56, name: "Taipei, Taiwan"}, {lat: 22.31, lng: 114.16, name: "Hong Kong"}, {lat: 14.59, lng: 120.98, name: "Manila, Philippines"}, {lat: 21.02, lng: 105.83, name: "Hanoi, Vietnam"}, {lat: 10.76, lng: 106.66, name: "Ho Chi Minh City, Vietnam"}, {lat: 13.75, lng: 100.50, name: "Bangkok, Thailand"}, {lat: 3.13, lng: 101.68, name: "Kuala Lumpur, Malaysia"}, {lat: 1.35, lng: 103.81, name: "Singapore"}, {lat: -6.20, lng: 106.81, name: "Jakarta, Indonesia"}, {lat: -8.40, lng: 115.18, name: "Bali, Indonesia"}, {lat: 28.61, lng: 77.20, name: "New Delhi, India"}, {lat: 19.07, lng: 72.87, name: "Mumbai, India"}, {lat: 12.97, lng: 77.59, name: "Bangalore, India"}, {lat: 22.57, lng: 88.36, name: "Kolkata, India"}, {lat: 33.68, lng: 73.04, name: "Islamabad, Pakistan"}, {lat: 24.86, lng: 67.00, name: "Karachi, Pakistan"}, {lat: 23.81, lng: 90.41, name: "Dhaka, Bangladesh"}, {lat: 27.71, lng: 85.32, name: "Kathmandu, Nepal"}, {lat: 34.52, lng: 69.17, name: "Kabul, Afghanistan"},
    // Middle East
    {lat: 35.68, lng: 51.38, name: "Tehran, Iran"}, {lat: 33.31, lng: 44.36, name: "Baghdad, Iraq"}, {lat: 24.71, lng: 46.67, name: "Riyadh, Saudi Arabia"}, {lat: 25.20, lng: 55.27, name: "Dubai, UAE"}, {lat: 31.95, lng: 35.92, name: "Amman, Jordan"}, {lat: 33.88, lng: 35.49, name: "Beirut, Lebanon"}, {lat: 31.76, lng: 35.21, name: "Jerusalem"}, {lat: 39.92, lng: 32.85, name: "Ankara, Turkey"}, {lat: 41.00, lng: 28.97, name: "Istanbul, Turkey"},
    // Oceania
    {lat: -33.86, lng: 151.20, name: "Sydney, Australia"}, {lat: -37.81, lng: 144.96, name: "Melbourne, Australia"}, {lat: -27.46, lng: 153.02, name: "Brisbane, Australia"}, {lat: -31.95, lng: 115.86, name: "Perth, Australia"}, {lat: -36.84, lng: 174.76, name: "Auckland, New Zealand"}, {lat: -41.28, lng: 174.77, name: "Wellington, New Zealand"}, {lat: -18.14, lng: 178.43, name: "Suva, Fiji"}, {lat: -9.44, lng: 147.18, name: "Port Moresby, Papua New Guinea"}
];

const locations = regions.map((r, i) => ({
    id: i + 1,
    lat: r.lat,
    lng: r.lng,
    radius: 3000,
    name: r.name
}));

const filePath = path.join(__dirname, 'data', 'global_locations.json');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
fs.writeFileSync(filePath, JSON.stringify(locations, null, 2));
console.log(`Generated ${locations.length} global locations at ${filePath}`);
