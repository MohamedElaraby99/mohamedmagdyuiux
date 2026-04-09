import { useState } from "react";
import { toast } from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { login } from "../Redux/Slices/AuthSlice";
import InputBox from "../Components/InputBox/InputBox";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaUserTie, FaSignInAlt } from "react-icons/fa";
import { generateDeviceFingerprint, getDeviceType, getBrowserInfo, getOperatingSystem } from "../utils/deviceFingerprint";
import logo2 from "../assets/logo2.png";
import { BRAND } from "../Constants/LayoutConfig";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  function handleUserInput(e) {
    const { name, value } = e.target;

    // Remove spaces from specific fields for easier login
    const fieldsToCleanSpaces = ['identifier', 'password'];
    const cleanValue = fieldsToCleanSpaces.includes(name) ? value.replace(/\s+/g, '') : value;

    setLoginData({
      ...loginData,
      [name]: cleanValue,
    });
  }

  async function onLogin(event) {
    event.preventDefault();

    if (!loginData.identifier || !loginData.password) {
      toast.error("املا كل البيانات المطلوبة");
      return;
    }

    // Validate if identifier is email or phone
    const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    const isPhone = phoneRegex.test(loginData.identifier);
    const isEmail = emailRegex.test(loginData.identifier);

    if (!isPhone && !isEmail) {
      toast.error("من فضلك ادخل بريد إلكتروني صحيح أو رقم هاتف مصري صحيح");
      return;
    }

    setIsLoading(true);

    // Generate device information for fingerprinting
    const deviceInfo = {
      platform: getDeviceType(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      additionalInfo: {
        browser: getBrowserInfo().browser,
        browserVersion: getBrowserInfo().version,
        os: getOperatingSystem(),
        language: navigator.language,
        colorDepth: window.screen.colorDepth,
        touchSupport: 'ontouchstart' in window,
      }
    };

    const Data = {
      password: loginData.password,
      deviceInfo: deviceInfo
    };

    // Set the correct field based on detection
    if (isPhone) {
      Data.phoneNumber = loginData.identifier;
    } else {
      Data.email = loginData.identifier;
    }

    // dispatch login action
    const response = await dispatch(login(Data));
    if (response?.payload?.success) {
      setLoginData({
        identifier: "",
        password: "",
      });
      navigate("/");
    }
    setIsLoading(false);
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-[#080E1E] py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-md w-full space-y-8">
          {/* Enhanced Header with Logo */}
          <div className="text-center">
            <h2 className="mb-3 text-4xl font-bold text-white">
              أهلاً وسهلاً
            </h2>
            <p className="text-lg text-slate-300">
              ادخل على حسابك عشان تكمل تعلم
            </p>
          </div>

          {/* Enhanced Modern Form */}
          <div className="rounded-3xl border border-white/10 bg-[#0c1428]/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm transition-colors duration-300">
            <form onSubmit={onLogin} className="space-y-6">

              {/* Identifier Field (Email or Phone) */}
              <div className="group">
                <label htmlFor="identifier" className="mb-3 block text-right text-sm font-semibold text-slate-300">
                  البريد الإلكتروني أو رقم الهاتف
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-primary group-focus-within:text-primary-dark transition-colors duration-200" />
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-white py-4 pl-4 pr-12 text-right text-gray-900 shadow-sm transition-all duration-300 placeholder:text-gray-500 hover:shadow-md focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                    placeholder="أدخل البريد الإلكتروني أو رقم الهاتف"
                    value={loginData.identifier}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="mb-3 block text-right text-sm font-semibold text-slate-300">
                  كلمة السر
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
                    className="block w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-right text-gray-900 shadow-sm transition-all duration-300 placeholder:text-gray-500 hover:shadow-md focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                    placeholder="اكتب كلمة السر"
                    value={loginData.password}
                    onChange={handleUserInput}
                  />
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
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-light to-primary rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

                <span className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      بندخلك...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      دخول
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
                    جديد في منصة  مستر Magdy Academy ؟
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Sign Up Link */}
            <div className="mt-6 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 font-semibold text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-darker transition-all duration-200 hover:scale-105"
              >
                <span>اعمل حساب</span>
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
                لما تدخل، إنت بتوافق على{" "}
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
    </Layout>
  );
}
