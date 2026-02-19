
const createNotification = async (notificationData) => {
    console.log('🔔 Mock Notification Service: Creating notification:', notificationData);
    // In a real implementation, this would save to a database or send real-time alerts
    // For now, we just log it to prevent server crashes
    return { success: true, message: 'Notification logged (mock service)' };
};

export default {
    createNotification
};
