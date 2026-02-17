import app from "./app.js";
const PORT = process.env.PORT || 4095;
// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'Sasaomar123@';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'Sasaomar123@';
process.env.JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '3650d'; // Short-lived access token
process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '3650d'; // Very long-lived refresh token (~10 years)
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '150d'; // Keep for backward compatibility
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mohamedmagdyuiux";
process.env.CLIENT_URL = process.env.CLIENT_URL || 'https://magdyacademy.com';
process.env.BACKEND_URL = process.env.BACKEND_URL || 'https://api.magdyacademy.com';
// Ensure cookies work across subdomains in production
process.env.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.magdyacademy.com';

const server = app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
    console.log(`production backend URL: ${process.env.BACKEND_URL}`);
    console.log(`production client URL: ${process.env.CLIENT_URL}`);
    console.log(`📊 Server configured for large payloads: 50MB limit`);
});

// Configure server timeouts for large payloads
server.timeout = 300000; // 5 minutes timeout for large requests
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds
