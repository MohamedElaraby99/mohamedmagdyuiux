import AppError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";
import userModel from '../models/user.model.js';
import UserDevice from '../models/userDevice.model.js';
import Purchase from '../models/purchase.model.js';
import CourseAccess from '../models/courseAccess.model.js';
import Course from '../models/course.model.js';
import { generateDeviceFingerprint, parseDeviceInfo } from '../utils/deviceUtils.js';

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new AppError("لازم تسجل دخول الأول عشان تكمل", 400))
    }

    try {
        // Only verify access tokens in this middleware
        const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

        // Ensure this is an access token, not a refresh token
        if (userDetails.type === 'refresh') {
            return next(new AppError("Invalid token type for this request", 401));
        }

        req.user = userDetails;
        next();
    } catch (error) {
        // Use 401 to indicate auth is required/expired so client can refresh
        if (error.name === 'TokenExpiredError') {
            return next(new AppError("انتهت صلاحية الجلسة، يتم التجديد...", 401));
        }
        return next(new AppError("الرمز غير صالح، يرجى تسجيل الدخول مرة أخرى", 401));
    }
}

// authorised roles
const authorisedRoles = (...roles) => async (req, res, next) => {
    const currentUserRoles = req.user.role;

    // SUPER_ADMIN has access to all admin routes
    if (currentUserRoles === 'SUPER_ADMIN') {
        return next();
    }

    if (!roles.includes(currentUserRoles)) {
        return next(new AppError("ليس لديك صلاحية للوصول إلى هذه الطريقة", 403))
    }
    next();
}

const authorizeSubscriber = async (req, res, next) => {
    const { role, id } = req.user;

    const user = await userModel.findById(id);

    if (!user) {
        return next(new AppError('المستخدم غير موجود', 404));
    }

    if (['ADMIN', 'SUPER_ADMIN'].includes(role)) {
        return next();
    }

    const subscriptionStatus = user.subscription?.status;

    if (subscriptionStatus !== 'active') {
        return next(new AppError('يجب أن يكون لديك اشتراك فعال للوصول إلى هذا المحتوى', 403));
    }

    next();
}

const verifyCourseAccess = async (req, res, next) => {
    try {
        const { role, id } = req.user;
        const userId = req.user._id || id;

        if (['ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return next();
        }

        const courseId = req.params.courseId || req.params.id;
        if (!courseId) {
            return next(new AppError('معرف الكورس مطلوب', 400));
        }

        const course = await Course.findById(courseId).select('price isFree units directLessons');
        if (!course) {
            return next(new AppError('الكورس غير موجود', 404));
        }

        if (course.isFree || (course.price != null && course.price <= 0)) {
            return next();
        }

        const lessonId = req.params.lessonId;
        if (lessonId) {
            const unitId = req.query.unitId;
            let lesson = null;
            let unit = null;

            if (unitId) {
                unit = course.units?.id(unitId);
                if (unit) lesson = unit.lessons?.id(lessonId);
            } else {
                lesson = course.directLessons?.id(lessonId);
                if (!lesson) {
                    for (const u of (course.units || [])) {
                        lesson = u.lessons?.id(lessonId);
                        if (lesson) { unit = u; break; }
                    }
                }
            }

            if (lesson?.isFree || unit?.isFree) {
                return next();
            }
        }

        const [purchase, access] = await Promise.all([
            Purchase.findOne({
                userId,
                courseId,
                purchaseType: 'course',
                status: 'completed'
            }),
            CourseAccess.findOne({
                userId,
                courseId,
                accessEndAt: { $gt: new Date() }
            })
        ]);

        if (purchase || access) {
            return next();
        }

        return next(new AppError('لازم تشتري الكورس أو تفعل كود وصول عشان تقدر تشوف المحتوى', 403));
    } catch (error) {
        return next(new AppError('حدث خطأ أثناء التحقق من صلاحية الوصول', 500));
    }
}

// Device verification middleware
const checkDeviceAuthorization = async (req, res, next) => {
    // Skip device check for device management routes to avoid circular dependency
    if (req.originalUrl.includes('/device-management/')) {
        return next();
    }

    // Skip device check for admin users
    if (req.user && ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return next();
    }

    try {
        const userId = req.user._id || req.user.id;

        // Generate device fingerprint for current request
        const deviceFingerprint = generateDeviceFingerprint(req, {
            platform: req.get('X-Device-Platform') || '',
            screenResolution: req.get('X-Screen-Resolution') || '',
            timezone: req.get('X-Timezone') || ''
        });

        // Check if device is authorized
        const authorizedDevice = await UserDevice.findOne({
            user: userId,
            deviceFingerprint,
            isActive: true
        });

        if (!authorizedDevice) {
            return next(new AppError(
                "هذا الجهاز غير مصرح له بالوصول. يرجى التواصل مع الإدارة لإعادة تعيين الأجهزة المصرحة",
                403,
                "DEVICE_NOT_AUTHORIZED"
            ));
        }

        // Update last activity
        authorizedDevice.lastActivity = new Date();
        await authorizedDevice.save();

        next();

    } catch (error) {
        // Don't block access if there's an error with device checking
        next();
    }
};

// Admin role check middleware
const requireAdmin = async (req, res, next) => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return next(new AppError("ليس لديك صلاحية للوصول إلى هذه الطريقة", 403));
    }
    next();
};

export {
    isLoggedIn,
    authorisedRoles,
    authorizeSubscriber,
    checkDeviceAuthorization,
    requireAdmin,
    verifyCourseAccess
}