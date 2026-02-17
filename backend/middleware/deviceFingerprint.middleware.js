import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to ensure device fingerprinting is present in authentication requests
 * This helps prevent unauthorized access and ensures proper device tracking
 */
export const requireDeviceFingerprint = (req, res, next) => {

    const { deviceInfo } = req.body;
    
    if (!deviceInfo) {
        return next(new ApiError(
            400, 
            "Device information is required for security purposes. Please enable JavaScript and try again.",
            "DEVICE_INFO_MISSING"
        ));
    }
    
    // Validate basic device info structure
    if (!deviceInfo.platform || !deviceInfo.screenResolution || !deviceInfo.timezone) {
        return next(new ApiError(
            400, 
            "Invalid device information format. Please refresh the page and try again.",
            "INVALID_DEVICE_INFO"
        ));
    }
    
    next();
};

/**
 * Middleware to log device fingerprinting attempts for security monitoring
 */
export const logDeviceFingerprint = (req, res, next) => {
    const { deviceInfo } = req.body;
    
    if (deviceInfo) {

    }
    
    next();
};
