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
    } else {
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
      <div className="min-h-screen flex items-center justify-center bg-[#080E1E] py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-md w-full space-y-8">
          {/* Enhanced Header with Logo */}
          <div className="text-center">
            <h2 className="mb-8 py-2 text-4xl font-bold leading-relaxed text-white">
              انضم إلى منصتنا التعليمية
            </h2>
            <p className="text-lg text-slate-300">
              أنشئ حسابك وابدأ رحلة التعلم
            </p>
          </div>

          {/* Enhanced Modern Form */}
          <div className="rounded-3xl border border-white/10 bg-[#0c1428]/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm transition-colors duration-300">
            <form onSubmit={createNewAccount} className="space-y-6">
              {/* Full Name Field */}
              <div className="group">
                <label htmlFor="fullName" className="mb-3 block text-right text-sm font-semibold text-slate-300">
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
                    className={`block w-full rounded-xl border bg-white py-4 pl-4 pr-12 text-right text-gray-900 shadow-sm transition-all duration-300 placeholder:text-gray-500 hover:shadow-md focus:outline-none focus:ring-4 ${fieldErrors.fullName
                      ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-primary focus:ring-primary/20'
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
                  <label htmlFor="phoneNumber" className="mb-3 block text-right text-sm font-semibold text-slate-300">
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
                      className={`block w-full rounded-xl border bg-white py-4 pl-4 pr-12 text-right text-gray-900 shadow-sm transition-all duration-300 placeholder:text-gray-500 hover:shadow-md focus:outline-none focus:ring-4 ${fieldErrors.phoneNumber
                        ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
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
                  <p className="mt-2 text-right text-xs text-slate-400">
                    الرقم ده هيبقى اسم المستخدم بتاعك عشان تدخل بيه
                  </p>
                </div>
              )}

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="mb-3 block text-right text-sm font-semibold text-slate-300">
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
                    className={`block w-full rounded-xl border bg-white py-4 pl-12 pr-12 text-right text-gray-900 shadow-sm transition-all duration-300 placeholder:text-gray-500 hover:shadow-md focus:outline-none focus:ring-4 ${fieldErrors.password
                      ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-primary focus:ring-primary/20'
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
                    className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors duration-200 hover:text-gray-600"
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
                  <div className="w-full border-t border-slate-600/80" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#0c1428] px-4 font-medium text-slate-400">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1428]/90 px-4 py-2 backdrop-blur-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
              <p className="text-sm font-medium text-slate-300">
                بإنشاء حساب، فإنك توافق على{" "}
                <Link to="/terms" className="text-primary dark:text-primary-light hover:underline font-semibold">
                  شروط الخدمة
                </Link>{" "}
                و{" "}
                <Link to="/privacy" className="text-primary dark:text-primary-light hover:underline font-semibold">
                  سياسة الخصوصية
                </Link>
              </p>
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal Removed */}
    </Layout>
  );
}
