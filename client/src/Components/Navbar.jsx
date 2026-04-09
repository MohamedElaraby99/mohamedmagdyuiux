import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaBars, FaHome, FaUser, FaGraduationCap, FaBlog, FaQuestionCircle, FaSignOutAlt, FaPlus, FaList, FaInfoCircle, FaPhone, FaHistory, FaArrowLeft } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/Slices/AuthSlice";
import logo from "../assets/logo.png";
import logo2 from "../assets/logo2.png";
import useScrollToTop from "../Helpers/useScrollToTop";
import CourseNotifications from "./CourseNotifications";
import { BRAND, NAVBAR } from "../Constants/LayoutConfig";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" ? true : false
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: user, role } = useSelector((state) => state.auth);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const dispatch = useDispatch();

  // Use scroll to top utility
  useScrollToTop();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleMenu = () => {
    if (user?.fullName) {
      const drawerToggle = document.getElementById('sidebar-drawer');
      if (drawerToggle) {
        drawerToggle.checked = !drawerToggle.checked;
      }
    } else {
      setIsMenuOpen((open) => !open);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const element = document.documentElement;
    element.classList.remove("light", "dark");
    if (isHome || darkMode) {
      element.classList.add("dark");
    } else {
      element.classList.add("light");
    }
    if (!isHome) {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }
  }, [darkMode, isHome]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      setDarkMode(false);
      localStorage.setItem("theme", "light");
    }
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  const menuItems = [

  ];

  const adminMenuItems = [
    { name: "لوحة التحكم", path: "/admin", icon: FaUser },
    { name: "إدارة المستخدمين", path: "/admin/users", icon: FaUser },
    { name: "إدارة المدونة", path: "/admin/blogs", icon: FaBlog },
    { name: "إدارة الأسئلة والأجوبة", path: "/admin/qa", icon: FaQuestionCircle },
    { name: "إدارة التصنيف", path: "/admin/subjects", icon: FaGraduationCap },
  ];

  const guestMobileNavLinkClass = (path) => {
    const active = location.pathname === path;
    if (isHome) {
      return `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
        active
          ? 'text-[#d8d9ff] bg-white/[0.08]'
          : 'text-slate-200 hover:bg-white/10 hover:text-white'
      }`;
    }
    return `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
      active
        ? 'text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30'
        : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;
  };

  const guestMobileIconBoxClass = (path) => {
    const active = location.pathname === path;
    if (isHome) {
      return `p-2 rounded-lg ${active ? 'bg-[#A5A6FF]/30 text-white' : 'bg-white/10 text-slate-200'}`;
    }
    return `p-2 rounded-lg ${active ? 'bg-purple-200 dark:bg-purple-800/50' : 'bg-gray-200 dark:bg-gray-700'}`;
  };

  return (
    <nav
      className={`sticky top-0 z-50 overflow-x-hidden transition-colors duration-300 ${
        isHome
          ? 'w-full border-b border-white/[0.06] shadow-none'
          : scrolled
            ? 'mx-3 sm:mx-5 mt-3 rounded-2xl shadow-lg shadow-purple-500/10'
            : 'mx-0 mt-0 rounded-none'
      } ${isHome ? 'navbar-home navbar-home-magdy' : ''}`}
      style={
        isHome
          ? {
              backgroundColor: '#080E1E',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              border: 'none',
            }
          : {
              backgroundColor: darkMode
                ? (scrolled ? 'rgba(17, 24, 39, 0.7)' : 'rgba(17, 24, 39, 0.5)')
                : (scrolled ? 'rgba(245, 240, 235, 0.65)' : 'rgba(245, 240, 235, 0.45)'),
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: scrolled ? '1px solid rgba(139, 92, 246, 0.12)' : 'none',
            }
      }
    >
      {!isHome && (
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] ${scrolled ? 'rounded-t-2xl' : ''}`}
          style={{ background: 'linear-gradient(90deg, #8B5CF6, #6C2BD9, #5B21B6)' }}
        />
      )}

      <div
        className={`max-w-7xl mx-auto mobile-menu-container ${isHome ? 'px-4 sm:px-8 lg:px-10' : 'px-3 sm:px-6 lg:px-8'}`}
      >
        <div className="flex justify-between items-center gap-3 h-16 md:h-[4.5rem] min-w-0">

          {/* شعار — على الرئيسية: MAGDY ACADEMY نص فقط */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group shrink min-w-0"
          >
            {!isHome && (
              <>
                <div className="relative">
                  <div className="relative rounded-xl group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={logo2}
                      alt="logo"
                      className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl md:text-2xl font-bold text-gradient-primary">{BRAND.teacherName}</h1>
                  <p className="text-[10px] -mt-1 text-gray-500 dark:text-gray-400">{BRAND.platformName}</p>
                </div>
              </>
            )}
            {isHome && (
              <span className="font-bold text-white uppercase tracking-[0.08em] sm:tracking-[0.12em] text-sm sm:text-lg md:text-2xl font-sans select-none truncate block max-w-[min(100%,11rem)] sm:max-w-[20rem] md:max-w-none">
                {BRAND.navbarWordmark || 'MAGDY ACADEMY'}
              </span>
            )}
          </Link>

          {/* Center Navigation - Desktop Only */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${location.pathname === item.path
                  ? 'text-primary dark:text-primary-light'
                  : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light'
                  }`}
              >
                {/* Active Indicator */}
                {location.pathname === item.path && (
                  <span className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl -z-10"></span>
                )}

                {/* Hover Effect */}
                <span className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>

                <span className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.name}
                </span>

                {/* Bottom Line */}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${location.pathname === item.path ? 'w-3/4' : 'w-0 group-hover:w-1/2'
                  }`}></span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-end gap-2 md:gap-3 shrink-0">

            {/* Auth Buttons - Not Logged In */}
            {!user?.fullName && (
              <div className={`flex items-center ${isHome ? 'gap-2 sm:gap-4 md:gap-5' : 'gap-2'}`}>
                {isHome ? (
                  <div className="hidden md:flex items-center gap-4 md:gap-5">
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center rounded-full px-5 sm:px-6 py-2.5 text-sm font-bold text-[#0a0f1a] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        backgroundColor: '#A5A6FF',
                        boxShadow: '0 0 28px rgba(165, 166, 255, 0.55), 0 4px 14px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      سجل الآن
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center rounded-full border-2 px-4 sm:px-5 py-2.5 text-sm font-semibold text-white border-[#A5A6FF] bg-transparent hover:bg-[#A5A6FF]/10 transition-colors duration-200"
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link
                      to="/login"
                      className="flex items-center gap-1 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border-2 hover:scale-105 active:scale-95 border-[#6C2BD9] text-[#6C2BD9] bg-transparent hover:bg-[#6C2BD9] hover:text-white"
                    >
                      <span>تسجيل الدخول</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                      style={{ backgroundColor: '#6C2BD9' }}
                    >
                      <span>اشترك الآن</span>
                      <FaArrowLeft className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                <button
                  type="button"
                  aria-expanded={isMenuOpen}
                  aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                  onClick={toggleMenu}
                  className={`md:hidden relative p-2.5 rounded-xl transition-all duration-300 group shrink-0 ${
                    isHome ? 'bg-white/10' : ''
                  }`}
                  style={isHome ? undefined : { backgroundColor: 'rgba(108, 43, 217, 0.1)' }}
                >
                  <FaBars
                    className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                    style={{ color: isHome ? '#ffffff' : '#6C2BD9' }}
                  />
                </button>
              </div>
            )}

            {/* User Section - Logged In */}
            {user?.fullName && (
              <div className="flex items-center gap-2 md:gap-3">
                {/* Notifications */}
                <CourseNotifications />

                {/* User Avatar - Desktop */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                      {user.fullName?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-primary dark:text-primary-light font-medium">
                      {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'مدير' : 'طالب'}
                    </p>
                  </div>
                </div>

                {/* Menu Button */}
                <button
                  onClick={toggleMenu}
                  className="relative p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-300 border border-primary/30 dark:border-primary/50 group"
                >
                  {/* Pulse Effect */}
                  <span className="absolute inset-0 rounded-xl bg-primary/20 animate-ping opacity-0 group-hover:opacity-75"></span>

                  <FaBars className="w-4 h-4 md:w-5 md:h-5 text-primary dark:text-primary-light relative z-10 transition-transform duration-300 group-hover:rotate-90" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu (ضيوف فقط — يُفتح بـ isMenuOpen) */}
        <div
          className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-[min(100vh,860px)] opacity-100 visible' : 'max-h-0 opacity-0 invisible pointer-events-none'
          }`}
        >
          <div
            className={`py-6 space-y-4 border-t backdrop-blur-xl ${
              isHome
                ? 'border-white/[0.08] bg-[#0a1224]/98 text-white'
                : 'border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95'
            }`}
          >
            {/* Navigation Links - Only for logged-in users */}
            {user && (
              <div className="space-y-1 px-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === item.path
                      ? "text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${location.pathname === item.path
                      ? "bg-primary/20 dark:bg-primary/30"
                      : "bg-gray-200 dark:bg-gray-700"
                      }`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* User Section */}
            {user && (
              <>
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4 px-4">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-primary dark:text-primary-light font-medium">{user.role}</p>
                    </div>
                  </div>
                </div>

                {user.role === "ADMIN" && (
                  <div className="space-y-1 px-2 pt-2">
                    <p className="px-4 text-xs font-bold text-primary dark:text-primary-light uppercase">لوحة الإدارة</p>
                    {adminMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === item.path
                          ? "text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20"
                          : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                      >
                        <div className={`p-2 rounded-lg ${location.pathname === item.path
                          ? "bg-primary/20 dark:bg-primary/30"
                          : "bg-gray-200 dark:bg-gray-700"
                          }`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="space-y-1 px-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                      <FaUser className="w-4 h-4" />
                    </div>
                    <span>الملف الشخصي</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                  >
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <FaSignOutAlt className="w-4 h-4" />
                    </div>
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </>
            )}

            {/* Guest Actions */}
            {!user?.fullName && (
              <>
                {/* Special Navigation for Guests */}
                <div className="space-y-1 px-2 pb-3">
                  <p
                    className={`px-4 pb-2 text-xs font-bold uppercase ${isHome ? 'text-[#A5A6FF]' : ''}`}
                    style={!isHome ? { color: '#6C2BD9' } : undefined}
                  >
                    تصفح المحتوى
                  </p>

                  {/* الكورسات */}
                  <Link to="/courses" className={guestMobileNavLinkClass('/courses')} onClick={() => setIsMenuOpen(false)}>
                    <div className={guestMobileIconBoxClass('/courses')}>
                      <FaGraduationCap className="w-4 h-4" />
                    </div>
                    <span>الكورسات</span>
                  </Link>

                  {/* المدونة */}
                  <Link to="/blogs" className={guestMobileNavLinkClass('/blogs')} onClick={() => setIsMenuOpen(false)}>
                    <div className={guestMobileIconBoxClass('/blogs')}>
                      <FaBlog className="w-4 h-4" />
                    </div>
                    <span>المدونة</span>
                  </Link>

                  {/* الأسئلة والأجوبة */}
                  <Link to="/qa" className={guestMobileNavLinkClass('/qa')} onClick={() => setIsMenuOpen(false)}>
                    <div className={guestMobileIconBoxClass('/qa')}>
                      <FaQuestionCircle className="w-4 h-4" />
                    </div>
                    <span>الأسئلة والأجوبة</span>
                  </Link>
                </div>

                {/* Login/Signup Buttons */}
                <div
                  className={`space-y-3 px-4 pt-4 border-t ${
                    isHome ? 'border-white/[0.08]' : 'border-gray-200/50 dark:border-gray-700/50'
                  }`}
                >
                  {isHome ? (
                    <>
                      <Link
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full text-sm font-bold text-[#0a0f1a] transition-transform duration-200 active:scale-[0.98]"
                        style={{
                          backgroundColor: '#A5A6FF',
                          boxShadow: '0 0 24px rgba(165, 166, 255, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        <FaPlus className="w-4 h-4" />
                        سجل الآن
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full border-2 text-sm font-semibold text-white border-[#A5A6FF] bg-transparent hover:bg-[#A5A6FF]/10 transition-colors duration-200"
                      >
                        <FaUser className="w-4 h-4" />
                        تسجيل الدخول
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 rounded-xl font-semibold transition-all duration-300"
                        style={{ borderColor: '#6C2BD9', color: '#6C2BD9' }}
                      >
                        <FaUser className="w-4 h-4" />
                        تسجيل الدخول
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #6C2BD9, #7C3AED)' }}
                      >
                        <FaPlus className="w-4 h-4" />
                        اشترك الآن
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
