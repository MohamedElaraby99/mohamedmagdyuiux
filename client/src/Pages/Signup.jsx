import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { createAccount } from "../Redux/Slices/AuthSlice";
import InputBox from "../Components/InputBox/InputBox";
import CaptchaComponent from "../Components/CaptchaComponent";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaGraduationCap, FaCamera, FaUpload, FaPhone, FaMapMarkerAlt, FaBook, FaExclamationTriangle, FaTimes, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { axiosInstance } from "../Helpers/axiosInstance";

import { egyptianCities } from "../utils/governorateMapping";
import { generateDeviceFingerprint, getDeviceType, getBrowserInfo, getOperatingSystem } from "../utils/deviceFingerprint";
import logo2 from "../assets/logo2.png";
import { BRAND } from "../Constants/LayoutConfig";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  /* Removed duplicate showPassword declaration */
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    avatar: "",
    adminCode: "",
  });

  // Check if this is an admin registration
  const isAdminRegistration = signupData.adminCode === 'ADMIN123';

  /* Removed stages fetching useEffect */

  function handleUserInput(e) {
    const { name, value } = e.target;

    // Remove spaces from specific fields for easier signup/signin
    const fieldsToCleanSpaces = ['email', 'password', 'phoneNumber', 'adminCode'];
    const cleanValue = fieldsToCleanSpaces.includes(name) ? value.replace(/\s+/g, '') : value;

    setSignupData({
      ...signupData,
      [name]: cleanValue,
    });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: null
      });
    }
  }

  function getImage(event) {
    event.preventDefault();
    // getting the image
    const uploadedImage = event.target.files[0];

    if (uploadedImage) {
      setSignupData({
        ...signupData,
        avatar: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setPreviewImage(this.result);
      });
    }
  }

  // CAPTCHA handlers
  function handleCaptchaVerified(sessionId) {

    setCaptchaSessionId(sessionId);
    setIsCaptchaVerified(true);

    // Add a small delay to ensure state is updated
    setTimeout(() => {

    }, 100);
  }

  function handleCaptchaError(error) {

    setIsCaptchaVerified(false);
    setCaptchaSessionId("");
  }


  // Enhanced error handler function
  function validateForm() {
    const errors = [];
    const newFieldErrors = {};


    // Check CAPTCHA verification
    /* 
    if (!isCaptchaVerified || !captchaSessionId) {
      errors.push("🔒 يرجى التحقق من رمز الأمان أولاً");
    }
    */

    /* Removed terms acceptance check */

    // Basic required fields for all users
    if (!signupData.fullName || signupData.fullName.trim() === "") {
      errors.push("👤 اكتب اسمك كامل - لازم يكون اسمك الثلاثي أو الرباعي");
      newFieldErrors.fullName = "اكتب اسمك كامل";
    } else if (signupData.fullName.length < 3) {
      errors.push("👤 الاسم ده قصير أوي - لازم يكون 3 حروف على الأقل");
      newFieldErrors.fullName = "الاسم قصير أوي";
    }

    if (!signupData.password || signupData.password.trim() === "") {
      errors.push("🔑 اختار كلمة سر قوية عشان تحمي حسابك");
      newFieldErrors.password = "اختار كلمة سر";
    } else if (signupData.password.length < 6) {
      errors.push("🔑 كلمة السر دي ضعيفة - لازم تكون 6 حروف على الأقل");
      newFieldErrors.password = "كلمة السر ضعيفة";
    }

    // Role-specific validation
    if (isAdminRegistration) {
      // For admin users: email is required
      if (!signupData.email || signupData.email.trim() === "") {
        errors.push("📧 اكتب الإيميل بتاعك - ده مطلوب للمشرفين");
        newFieldErrors.email = "اكتب الإيميل بتاعك";
      } else if (!signupData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        errors.push("📧 الإيميل ده مش صح - اكتبه صح كده (مثال: ahmed@gmail.com)");
        newFieldErrors.email = "الإيميل مش صح";
      }
    } else {
      // For regular users: phone number is required
      if (!signupData.phoneNumber || signupData.phoneNumber.trim() === "") {
        errors.push("📱 اكتب رقم التليفون بتاعك - ده هيبقى اسم المستخدم بتاعك");
        newFieldErrors.phoneNumber = "اكتب رقم التليفون";
      } else if (!signupData.phoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        errors.push("📱 رقم التليفون ده مش صح - اكتب رقم مصري صح (مثال: 01234567890)");
        newFieldErrors.phoneNumber = "رقم التليفون مش صح";
      }

      // Validate email if provided (optional for regular users)
      if (signupData.email && signupData.email.trim() !== "" && !signupData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        errors.push("📧 الإيميل ده مش صح - اكتبه صح كده (مثال: ahmed@gmail.com)");
        newFieldErrors.email = "الإيميل مش صح";
      }
    }

    // Update field errors state
    setFieldErrors(newFieldErrors);

    return errors;
  }

  async function createNewAccount(event) {
    event.preventDefault();

    // Prevent double submission
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    // Check CAPTCHA verification first

    // Validate form and get all errors
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      // Show first error
      toast.error(validationErrors[0]);

      // If there are multiple errors, show a summary after a delay
      if (validationErrors.length > 1) {
        setTimeout(() => {
          const remainingErrors = validationErrors.slice(1);
          const errorSummary = `📝 فيه ${remainingErrors.length} مشكلة تانية:\n\n${remainingErrors.join('\n\n')}`;
          toast.error(errorSummary, {
            duration: 8000,
            style: {
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '14px',
              lineHeight: '1.5',
              textAlign: 'right',
              direction: 'rtl'
            }
          });
        }, 2500);
      }

      /* Removed terms validation */

      // Reset CAPTCHA verification ONLY if CAPTCHA was the issue
      if (!isCaptchaVerified || !captchaSessionId) {
        setIsCaptchaVerified(false);
        setCaptchaSessionId("");
        setCaptchaReset(true);
        setTimeout(() => setCaptchaReset(false), 100);
      }

      setIsLoading(false);
      return;
    }

    // Generate device information for fingerprinting
    const deviceInfo = {
      platform: getDeviceType(),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      additionalInfo: {
        browser: getBrowserInfo().browser,
        browserVersion: getBrowserInfo().version,
        os: getOperatingSystem(),
        language: navigator.language,
        colorDepth: screen.colorDepth,
        touchSupport: 'ontouchstart' in window,
      }
    };

    // Create request data with device info as JSON object
    const requestData = {
      fullName: signupData.fullName,
      password: signupData.password,
      adminCode: signupData.adminCode,
      captchaSessionId: captchaSessionId,
      deviceInfo: deviceInfo
    };

    // Add role-specific fields
    if (isAdminRegistration) {
      // For admin users: email is required
      requestData.email = signupData.email;


      // For regular users: phone number is required
      requestData.phoneNumber = signupData.phoneNumber;

      // Do not send email for regular users as the field is removed from UI
      // This prevents autofill from sending 'superadmin@api.com'
      /*
      if (signupData.email && signupData.email.trim() !== "") {
        requestData.email = signupData.email;
      }
      */
    }

    // Handle avatar file separately if present
    if (signupData.avatar) {
      const formData = new FormData();
      formData.append("avatar", signupData.avatar);

      // Add captchaSessionId at the top level for middleware access
      formData.append("captchaSessionId", captchaSessionId);

      // Add device info as separate fields for device fingerprint middleware
      formData.append("deviceInfo[platform]", deviceInfo.platform);
      formData.append("deviceInfo[screenResolution]", deviceInfo.screenResolution);
      formData.append("deviceInfo[timezone]", deviceInfo.timezone);
      formData.append("deviceInfo[additionalInfo][browser]", deviceInfo.additionalInfo.browser);
      formData.append("deviceInfo[additionalInfo][browserVersion]", deviceInfo.additionalInfo.browserVersion);
      formData.append("deviceInfo[additionalInfo][os]", deviceInfo.additionalInfo.os);
      formData.append("deviceInfo[additionalInfo][language]", deviceInfo.additionalInfo.language);
      formData.append("deviceInfo[additionalInfo][colorDepth]", deviceInfo.additionalInfo.colorDepth);
      formData.append("deviceInfo[additionalInfo][touchSupport]", deviceInfo.additionalInfo.touchSupport);

      // Add all other data as JSON string
      formData.append("data", JSON.stringify(requestData));

      // Debug: Log what's being sent

      for (let [key, value] of formData.entries()) {

      }

      // dispatch create account action with FormData
      try {
        const response = await dispatch(createAccount(formData));
        if (response?.payload?.success) {
          setSignupData({
            fullName: "",
            email: "",
            password: "",
            phoneNumber: "",
            governorate: "",
            age: "",
            avatar: "",
            adminCode: "",
          });

          setPreviewImage("");
          setIsCaptchaVerified(false);
          setCaptchaSessionId("");
          setCaptchaReset(true);
          setTimeout(() => setCaptchaReset(false), 100);

          navigate("/");
        } else {
          // If signup failed, reset CAPTCHA for security
          setIsCaptchaVerified(false);
          setCaptchaSessionId("");
          setCaptchaReset(true);
          setTimeout(() => setCaptchaReset(false), 100);
          setIsLoading(false);
        }
      } catch (error) {
        // Reset CAPTCHA on error
        setIsCaptchaVerified(false);
        setCaptchaSessionId("");
        setCaptchaReset(true);
        setTimeout(() => setCaptchaReset(false), 100);
        setIsLoading(false);
      }
    } else {
      // No avatar file, send as JSON

      try {
        const response = await dispatch(createAccount(requestData));
        if (response?.payload?.success) {
          setSignupData({
            fullName: "",
            email: "",
            password: "",
            phoneNumber: "",
            governorate: "",
            age: "",
            avatar: "",
            adminCode: "",
          });

          setPreviewImage("");
          setIsCaptchaVerified(false);
          setCaptchaSessionId("");
          setCaptchaReset(true);
          setTimeout(() => setCaptchaReset(false), 100);

          navigate("/");
        } else {
          // If signup failed, reset CAPTCHA for security
          setIsCaptchaVerified(false);
          setCaptchaSessionId("");
          setCaptchaReset(true);
          setTimeout(() => setCaptchaReset(false), 100);
          setIsLoading(false);
        }
      } catch (error) {
        // Reset CAPTCHA on error
        setIsCaptchaVerified(false);
        setCaptchaSessionId("");
        setCaptchaReset(true);
        setTimeout(() => setCaptchaReset(false), 100);
        setIsLoading(false);
      }
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-md w-full space-y-8">
          {/* Enhanced Header with Logo */}
          <div className="text-center">
            {/* Modern Logo Container */}
            <div className="flex justify-center items-center mb-8">
              <div className="relative">
                {/* Glowing Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-light to-primary-dark rounded-full blur-2xl opacity-30 animate-pulse"></div>

                {/* Logo Container */}
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-2xl border-4 border-primary/20 dark:border-primary/50 transform hover:scale-110 transition-all duration-500">
                  <img
                    src={BRAND.logoUrl || logo2}
                    alt={BRAND.platformName}
                    className="w-16 h-16 object-contain drop-shadow-lg"
                  />
                </div>

                {/* Floating Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary-light rounded-full animate-bounce z-10 shadow-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-pulse z-10 shadow-lg"></div>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-primary dark:text-white mb-6 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              انضم إلى منصتنا التعليمية
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              أنشئ حسابك وابدأ رحلة التعلم
            </p>
          </div>

          {/* Enhanced Modern Form */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-primary/20 dark:border-primary/50 transform hover:scale-[1.02] transition-all duration-500">
            <form onSubmit={createNewAccount} className="space-y-6">
              {/* Full Name Field */}
              <div className="group">
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  الاسم
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-primary group-focus-within:text-primary-dark transition-colors duration-200" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className={`block w-full pr-12 pl-4 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${fieldErrors.fullName
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="أدخل اسمك الكامل"
                    value={signupData.fullName}
                    onChange={handleUserInput}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Number Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    رقم الهاتف *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-primary group-focus-within:text-primary-dark transition-colors duration-200" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      className={`block w-full pr-12 pl-4 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${fieldErrors.phoneNumber
                        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                        : 'border-gray-200 dark:border-gray-600 focus:ring-primary/20 focus:border-primary'
                        }`}
                      placeholder="اكتب رقم تليفونك"
                      value={signupData.phoneNumber}
                      onChange={handleUserInput}
                    />
                    {fieldErrors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                        <FaExclamationTriangle className="text-xs" />
                        {fieldErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                    الرقم ده هيبقى اسم المستخدم بتاعك عشان تدخل بيه
                  </p>
                </div>
              )}

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-primary group-focus-within:text-primary-dark transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`block w-full pr-12 pl-12 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${fieldErrors.password
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="أنشئ كلمة مرور قوية"
                    value={signupData.password}
                    onChange={handleUserInput}
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {fieldErrors.password}
                    </p>
                  )}
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>


              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white btn-primary focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg overflow-hidden"
              >
                {/* Button Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-light to-primary-dark rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

                <span className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      إنشاء الحساب
                    </>
                  )}
                </span>

                {/* Creative Button Border Animation */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-light via-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </button>
            </form>

            {/* Enhanced Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                    عندك حساب خلاص؟
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-darker transition-all duration-200 hover:scale-105"
              >
                <span>ادخل على حسابك</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                بإنشاء حساب، فإنك توافق على{" "}
                <Link to="/terms" className="text-primary dark:text-primary-light hover:underline font-semibold">
                  شروط الخدمة
                </Link>{" "}
                و{" "}
                <Link to="/privacy" className="text-primary dark:text-primary-light hover:underline font-semibold">
                  سياسة الخصوصية
                </Link>
              </p>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal Removed */}
    </Layout>
  );
}
