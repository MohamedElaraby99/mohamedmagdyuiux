import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/Slices/AuthSlice";
import { getWalletBalance } from "../Redux/Slices/WalletSlice";
import { Link, useNavigate } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import {
  FaHome,
  FaUserCircle,
  FaPlus,
  FaList,
  FaInfoCircle,
  FaPhone,
  FaBlog,
  FaQuestionCircle,
  FaWallet,
  FaCreditCard,
  FaUsers,
  FaWhatsapp,
  FaHistory,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaChevronDown,
  FaChevronUp,
  FaServer,
  FaVideo,
  FaClipboardCheck,
  FaUserSecret,
  FaChartBar,
  FaQrcode,
  FaUser,
  FaQuoteRight
} from "react-icons/fa";
import logo2 from "../assets/logo2.png";
import { BRAND, SIDEBAR } from "../Constants/LayoutConfig";

export default function Sidebar({ hideBar = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoggedIn, role, data } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);

  // Fetch wallet balance when user is logged in
  useEffect(() => {
    if (isLoggedIn && !["ADMIN", "SUPER_ADMIN"].includes(role)) {
      dispatch(getWalletBalance());
    }
  }, [dispatch, isLoggedIn, role]);

  // Track sidebar open/close state
  useEffect(() => {
    const drawerToggle = document.getElementById('sidebar-drawer');
    if (!drawerToggle) return;

    // Sync initial state
    setIsSidebarOpen(drawerToggle.checked);

    const handleChange = () => {
      setIsSidebarOpen(drawerToggle.checked);
    };

    // Listen for change events
    drawerToggle.addEventListener('change', handleChange);

    // Also use MutationObserver for cases where checked property changes without event
    const observer = new MutationObserver(() => {
      setIsSidebarOpen(drawerToggle.checked);
    });
    observer.observe(drawerToggle, { attributes: true, attributeFilter: ['checked'] });

    return () => {
      drawerToggle.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  const onLogout = async function () {
    await dispatch(logout());
    navigate("/");
  };

  // Function to get user initials from full name
  const getUserInitials = (fullName) => {
    if (!fullName) return "U";
    const names = fullName.split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const closeSidebar = () => {
    const drawerToggle = document.getElementById('sidebar-drawer');
    if (drawerToggle) {
      drawerToggle.checked = false;
      // Dispatch change event to trigger any listeners
      drawerToggle.dispatchEvent(new Event('change', { bubbles: true }));
      setIsSidebarOpen(false);
    }
  };

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(!adminDropdownOpen);
  };

  return (
    <>
      {/* Overlay - positioned OUTSIDE drawer structure for proper fixed positioning */}
      {isSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            cursor: 'pointer'
          }}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className="drawer drawer-end">
        <input className="drawer-toggle" id="sidebar-drawer" type="checkbox" />
        <div className="drawer-side" style={{ zIndex: 9999 }}>
          {/* DaisyUI drawer overlay (hidden) */}
          <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
          <div className="min-h-full w-64 bg-white dark:bg-gray-900 text-base-content p-3 relative shadow-2xl" style={{ zIndex: 10000 }} dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Link to="/" onClick={closeSidebar} className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={logo2}
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </Link>
              <button
                onClick={closeSidebar}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-300"
              >
                <AiFillCloseCircle size={20} />
              </button>
            </div>

            {/* Super Admin Status Banner */}
            {role === "SUPER_ADMIN" && (
              <div className="mb-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-3 text-white shadow-lg">
                <div className="flex items-center gap-2">
                  <FaUserSecret size={18} className="text-white" />
                  <div>
                    <div className="font-bold text-sm">المدير المميز</div>
                    <div className="text-xs opacity-90">صلاحيات كاملة للنظام</div>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Balance */}
            {isLoggedIn && !["ADMIN", "SUPER_ADMIN"].includes(role) && (
              <div className="mb-4">
                <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-lg p-3 text-white shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaWallet className="text-white" size={14} />
                      <span className="text-xs font-medium">رصيد المحفظة</span>
                    </div>
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-base font-bold mb-1">
                    {balance ? `${balance.toFixed(2)}` : "0.00"}
                  </div>
                  <div className="text-xs opacity-90">جنيه مصري</div>
                  <Link
                    to="/wallet"
                    className="mt-2 block w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200 text-center"
                    onClick={closeSidebar}
                  >
                    إدارة المحفظة
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <ul className="menu space-y-1">
              {/* Items shown to everyone */}
              <li>
                <Link to="/" className="flex gap-3 items-center text-gray-700 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors text-right py-2" onClick={closeSidebar}>
                  <FaHome size={16} className="text-gray-500 dark:text-slate-100" />
                  الرئيسية

                </Link>
              </li>

              {/* Courses - always visible but with different label */}
              <li>
                <Link to="/courses" className="flex gap-3 items-center text-gray-700 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors text-right py-2" onClick={closeSidebar}>
                  <FaList size={16} className="text-gray-500 dark:text-slate-100" />
                  {isLoggedIn && (role === "ADMIN" || role === "SUPER_ADMIN") ? "جميع الكورسات " : isLoggedIn ? "كورساتي" : "الكورسات"}

                </Link>
              </li>


              {/* Blog and Q&A - always visible */}
              <li>
                <Link to="/blogs" className="flex gap-3 items-center text-gray-700 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors py-2" onClick={closeSidebar}>
                  <FaBlog size={16} className="text-gray-500 dark:text-slate-100" />
                  المدونة
                </Link>
              </li>

              <li>
                <Link to="/qa" className="flex gap-3 items-center text-gray-700 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors py-2" onClick={closeSidebar}>
                  <FaQuestionCircle size={16} className="text-gray-500 dark:text-slate-100" />
                  المنتدى
                </Link>
              </li>

              {/* ============ LOGGED-IN ONLY ITEMS ============ */}
              {isLoggedIn && (
                <>
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <li>
                      <Link to="/admin/dashboard" className="border-t border-red-200 dark:border-red-800 bg-red-200 dark:bg-red-800 flex gap-3 items-center text-gray-700 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors text-right py-2" onClick={closeSidebar}>
                        <FaUserCircle size={16} className="text-gray-500 dark:text-slate-100" />
                        لوحة تحكم الإدارة

                      </Link>
                    </li>
                  )}

                  {!["ADMIN", "SUPER_ADMIN"].includes(role) && (
                    <li>
                      <Link to="/wallet" className="flex gap-3 items-center text-gray-700 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors text-right py-2" onClick={closeSidebar}>
                        <FaWallet size={16} className="text-gray-500 dark:text-slate-100" />
                        محفظتي

                      </Link>
                    </li>

                  )}
                  <li>
                    <Link to="/exam-history" className="flex gap-3 items-center text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors py-2" onClick={closeSidebar}>
                      <FaHistory size={16} className="text-gray-500 dark:text-slate-100" />
                      سجل الامتحانات
                    </Link>
                  </li>
                  <li>
                    <Link to="/live-meetings" className="flex gap-3 items-center text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors text-right py-2" onClick={closeSidebar}>
                      <FaVideo size={16} className="text-gray-500 dark:text-slate-100" />
                      الجلسات المباشرة

                    </Link>
                  </li>


                  {/* Admin Services Dropdown */}
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <li>
                      <button
                        onClick={toggleAdminDropdown}
                        className="flex gap-3 items-center justify-between w-full text-gray-700 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors py-2"
                      >
                        <div className="flex gap-3 items-center">
                          <FaInfoCircle size={16} className="text-gray-500 dark:text-slate-100" />
                          خدمات الإدارة
                        </div>
                        {adminDropdownOpen ? (
                          <FaChevronUp size={12} className="text-gray-500 dark:text-slate-100" />
                        ) : (
                          <FaChevronDown size={12} className="text-gray-500 dark:text-slate-100" />
                        )}
                      </button>

                      {adminDropdownOpen && (
                        <ul className="mt-1 mr-6 space-y-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <li>
                            <Link
                              to="/admin/blog-dashboard"
                              className="flex gap-3 items-center text-xs text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={closeSidebar}
                            >
                              <FaBlog size={14} className="text-gray-500 dark:text-slate-100" />
                              إدارة المدونة
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/pending-tasks"
                              className="flex gap-3 items-center text-xs text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={closeSidebar}
                            >
                              <FaClipboardCheck size={14} className="text-gray-500 dark:text-slate-100" />
                              تقييم مهام الطلاب
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/qa-dashboard"
                              className="flex gap-3 items-center text-xs text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={closeSidebar}
                            >
                              <FaQuestionCircle size={14} className="text-gray-500 dark:text-slate-100" />
                              إدارة الأسئلة والأجوبة
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/admin/live-meetings"
                              className="flex gap-3 items-center text-xs text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={closeSidebar}
                            >
                              <FaVideo size={14} className="text-gray-500 dark:text-slate-100" />
                              إدارة الجلسات المباشرة
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/admin/testimonials"
                              className="flex gap-3 items-center text-xs text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={closeSidebar}
                            >
                              <FaQuoteRight size={14} className="text-gray-500 dark:text-slate-100" />
                              إدارة الآراء
                            </Link>
                          </li>


                        </ul>
                      )}
                    </li>
                  )}




                </>
              )}
            </ul>

            {/* User Section */}
            <div className="absolute bottom-2 left-3 right-3">
              {isLoggedIn ? (
                <div className="w-full flex flex-col gap-2 items-center justify-center">
                  {/* User Avatar */}
                  <Link
                    to="/user/profile"
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-white dark:border-gray-700"
                    onClick={closeSidebar}
                  >
                    {data?.avatar?.secure_url ? (
                      <img
                        src={data.avatar.secure_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getUserInitials(data?.fullName)
                    )}
                  </Link>

                  {/* User Name */}
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {data?.fullName || "User"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {role === "SUPER_ADMIN" ? "مدير مميز" : role === "ADMIN" ? "مدير" : "طالب"}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={onLogout}
                    disabled={isLoading}
                    className="w-full group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-pink-500 p-0.5 hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="relative flex items-center justify-center gap-1 rounded-[6px] bg-white dark:bg-gray-800 px-2 py-1.5 transition-all duration-300 group-hover:bg-transparent">
                      <div className="relative z-10 flex items-center gap-1">
                        <svg className="w-3 h-3 text-red-500 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-semibold text-xs text-red-500 group-hover:text-white transition-colors duration-300">
                          {isLoading ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent"></div>
                              جاري تسجيل الخروج...
                            </div>
                          ) : (
                            "تسجيل الخروج"
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-3 items-center justify-center px-1">
                  {/* Sign In Button */}
                  <Link
                    to="/login"
                    onClick={closeSidebar}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95"
                    style={{ borderColor: '#6C2BD9', color: '#6C2BD9' }}
                  >
                    <FaUser className="w-4 h-4" />
                    تسجيل الدخول
                  </Link>

                  {/* Sign Up Button */}
                  <Link
                    to="/signup"
                    onClick={closeSidebar}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #6C2BD9, #7C3AED)' }}
                  >
                    <FaPlus className="w-4 h-4" />
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
