/**
 * ============================================
 * ملف إعدادات التخطيط - Layout Configuration
 * ============================================
 * 
 * غيّر القيم في هذا الملف وسيتم تطبيقها تلقائياً
 * على جميع أجزاء الموقع (الهيدر، الفوتر، الصفحة الرئيسية)
 * 
 * Change values in this file and they will be automatically
 * applied to all parts of the website (header, footer, homepage)
 */

// ============================================
// 1. معلومات العلامة التجارية - Brand Info
// ============================================
// ============================================
// 1. معلومات العلامة التجارية - Brand Info
// ============================================
export const BRAND = {
    // اسم المنصة
    platformName: "E-learning Platform",
    // اسم المعلم
    teacherName: "Magdy Academy",
    // الاسم الكامل
    fullName: "Magdy Academy",
    // وصف قصير
    shortDescription: "تعلم تصميم UX/UI باحترافية",
    // الشعار (اتركه فارغاً لاستخدام الشعار الافتراضي)
    logoUrl: "",
    // الشعار الثانوي
    secondaryLogoUrl: "",
};

// ============================================
// 2. إعدادات الهيدر/النافبار - Navbar Settings
// ============================================
export const NAVBAR = {
    showTeacherName: true,
    showPlatformDescription: true,
    bgColor: "dark:bg-gray-900",
    accentLineColors: "from-purple-400 via-violet-500 to-purple-600",
    height: "h-16 md:h-20",
};

// ============================================
// 3. قسم الهيرو (البانر الرئيسي) - Hero Section
// ============================================
export const HERO = {
    // العنوان الرئيسي
    mainTitle: "ابدأ مسيرتك في تصميم UX/UI",
    // العنوان الفرعي
    subtitle: "تصميم UX/UI",
    // النص أعلى العنوان
    topText: "اتعلم المهارات اللى هتفتحلك فرص كبيرة!",
    // نص زر الاشتراك
    ctaButtonText: "اشترك الآن",
    // رابط زر الاشتراك
    ctaButtonLink: "/signup",
    // صورة المعلم في الهيرو
    teacherImageUrl: "",
    // إظهار صورة المعلم
    showTeacherImage: true,
    // لون الخلفية
    bgGradient: "from-purple-50 via-white to-violet-50",
};

// ============================================
// 4. معلومات التواصل - Contact Information
// ============================================
export const CONTACT = {
    // رقم الحجز والاستفسارات
    bookingPhone: "+201207039410",
    bookingPhoneLabel: "الحجز والاستفسارات",
    // رقم الدعم الفني
    supportPhone: "+201207039410",
    supportPhoneLabel: "الدعم الفني",
    // البريد الإلكتروني
    email: "support@mansety.com",
    // العنوان
    address: "",
    // عنوان قسم التواصل
    sectionTitle: "تواصل معنا",
    sectionSubtitle: "محتاج مساعدة ؟ تواصل معنا علطول على الارقام التاليه واتساب او اتصال",
};

// ... (omitted sections)

// ============================================
// 5. روابط السوشيال ميديا - Social Media Links
// ============================================
export const SOCIAL_MEDIA = {
    facebook: {
        url: "https://www.facebook.com/ahmedmagdyFACI?locale=ar_AR",
        label: "Facebook",
        enabled: true,
    },
    youtube: {
        url: "https://www.youtube.com/@AhmedMagdy-r5p",
        label: "YouTube",
        enabled: true,
    },
    tiktok: {
        url: "https://www.tiktok.com/@eng.ahmed0512?_r=1&_t=ZS-93ytafTWH6i",
        label: "Tiktok",
        enabled: true,
    },
    instagram: {
        url: "https://www.instagram.com/",
        label: "Instagram",
        enabled: true,
    },
    twitter: {
        url: "https://twitter.com/",
        label: "Twitter",
        enabled: false,
    },
    whatsapp: {
        url: "https://wa.me/201028510498",
        label: "WhatsApp",
        enabled: true,
    },
};

// ============================================
// 6. إعدادات الفوتر - Footer Settings
// ============================================
export const FOOTER = {
    // نص حقوق النشر
    copyrightText: "جميع الحقوق محفوظة",
    // السنة (اتركها فارغة لاستخدام السنة الحالية)
    year: "",
    // إظهار السوشيال ميديا في الفوتر
    showSocialMedia: true,
    // إظهار معلومات التواصل في الفوتر
    showContactInfo: true,
    // روابط إضافية في الفوتر
    links: [
        { label: "الشروط والأحكام", url: "/terms" },
        { label: "سياسة الخصوصية", url: "/privacy" },
        { label: "من نحن", url: "/about" },
    ],
    // معلومات المطور
    developer: {
        name: "Fikra Software",
        url: "https://www.facebook.com/people/Fikra-Software-%D9%81%D9%83%D8%B1%D8%A9/61572824761047/",
        showInFooter: true,
    },
};

// ============================================
// 7. إعدادات الدفع والشحن - Payment Settings
// ============================================
export const PAYMENT = {
    // واتساب للحصول على كود شحن
    whatsappForCodes: {
        phone: "01028510498",
        label: "للحصول على كود شحن - تواصل معنا على واتساب",
        enabled: true,
    },
    // رقم واتساب للتواصل
    whatsappContact: {
        phone: "01028510498",
        label: "رقم الواتساب",
        description: "متاح على مدار 24/7",
        enabled: true,
    },
    // فودافون كاش
    vodafoneCash: {
        phone: "01028510498",
        label: "فودافون كاش",
        description: "ادفع المبلغ وسيصلك الكود فوراً",
        enabled: true,
    },
    instaPay: {
        phone: "01028510498",
        label: "انستا باي",
        enabled: true,
    },
    bankMisr: {
        accountName: "Ahmed Magdy Abdullah",
        accountNumber: "7310383000010136",
        label: "حساب بنك مصر",
        enabled: true
    },
    saudiPayment: {
        bankMisrIban: {
            accountName: "Ahmed Magdy Abdullah",
            iban: "EG630002073107310383000010136",
            label: "إيبان بنك مصر"
        },
        rajhiBank: {
            accountName: "Mohamed Mahmoud Abdullah",
            accountNumber: "283000010006086155093",
            label: "حساب سعودي (بنك الراجحي)"
        },
        label: "للتحويل من المملكة العربية السعودية",
        enabled: true
    },
    internationalPayment: {
        label: "للتحويل من أي دولة عربية أخرى الرجاء التواصل واتساب",
        enabled: true
    },
    // عنوان قسم الشحن
    sectionTitle: "كيفية الشحن:",
    // خطوات الشحن
    steps: [
        "حول المبلغ الكورس على فودافون كاش أو انستا باي من خلال الأرقام التي في الأسفل",
        "تواصل على واتساب وارسل صورة التحويل واسمك للحصول على كود الشحن ",
        "سيتم اضافة المبلغ الى محفظتك فور حصولك على كود الشحن",
        "يمكنك الاشتراك في الكورس الذي تريده بعد شحن المحفظة",
    ],
};

// ============================================
// 8. إعدادات السايدبار - Sidebar Settings
// ============================================
export const SIDEBAR = {
    // عنوان السايدبار
    title: "Magdy Academy",
    // إظهار رصيد المحفظة
    showWalletBalance: true,
    // ألوان السايدبار
    bgColor: "bg-white dark:bg-gray-900",
};

// ============================================
// 9. الألوان الرئيسية - Theme Colors
// ============================================
/**
 * لتغيير اللون الرئيسي للموقع:
 * 1. افتح ملف src/index.css
 * 2. غيّر قيم CSS variables في قسم :root
 * 
 * أمثلة للألوان الشائعة:
 * - أخضر (الحالي): #22c55e
 * - أزرق: #3b82f6
 * - بنفسجي: #8b5cf6
 * - أحمر: #ef4444
 * - برتقالي: #f97316
 */
export const COLORS = {
    // اللون الرئيسي (بنفسجي)
    primary: {
        50: "#F8F5FF",
        100: "#EDE9FE",
        200: "#DDD6FE",
        300: "#C4B5FD",
        400: "#A78BFA",
        500: "#6C2BD9",
        600: "#5B21B6",
        700: "#4C1D95",
        gradient: "from-purple-500 via-violet-600 to-purple-700",
    },
    secondary: {
        500: "#7C3AED",
        gradient: "from-violet-500 to-purple-600",
    },
    accent: {
        500: "#A78BFA",
        gradient: "from-purple-400 to-violet-500",
    },
    tailwind: {
        primary: "purple",
        secondary: "violet",
        accent: "purple",
    }
};

// ============================================
// دالة مساعدة للحصول على السنة الحالية
// ============================================
export const getCurrentYear = () => {
    return FOOTER.year || new Date().getFullYear();
};

// ============================================
// تصدير جميع الإعدادات ككائن واحد
// ============================================
const LayoutConfig = {
    BRAND,
    NAVBAR,
    HERO,
    CONTACT,
    SOCIAL_MEDIA,
    FOOTER,
    PAYMENT,
    SIDEBAR,
    COLORS,
    getCurrentYear,
};

export default LayoutConfig;
