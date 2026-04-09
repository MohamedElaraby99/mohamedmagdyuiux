import React, { useEffect, useState } from "react";
import { FaBars, FaArrowLeft } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import logo2 from "../assets/logo2.png";
import useScrollToTop from "../Helpers/useScrollToTop";
import CourseNotifications from "./CourseNotifications";
import { BRAND } from "../Constants/LayoutConfig";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" ? true : false
  );
  const [scrolled, setScrolled] = useState(false);
  const { data: user, role } = useSelector((state) => state.auth);
  const location = useLocation();
  const path = location.pathname;
  /** نفس شكل هيدر الصفحة الرئيسية: خلفية داكنة، ووردمارك، أزرار الهوم */
  const isHomeNavStyle =
    path === "/" ||
    path === "/login" ||
    path === "/signup" ||
    path === "/terms" ||
    path === "/privacy" ||
    path === "/exam-history" ||
    path === "/wallet" ||
    path === "/live-meetings" ||
    path.startsWith("/user/profile") ||
    path.startsWith("/courses") ||
    path.startsWith("/blogs") ||
    path.startsWith("/qa");
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

  const toggleMenu = () => {
    const drawerToggle = document.getElementById("sidebar-drawer");
    if (drawerToggle) {
      drawerToggle.checked = !drawerToggle.checked;
      drawerToggle.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const element = document.documentElement;
    element.classList.remove("light", "dark");
    if (isHomeNavStyle || darkMode) {
      element.classList.add("dark");
    } else {
      element.classList.add("light");
    }
    if (!isHomeNavStyle) {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }
  }, [darkMode, isHomeNavStyle]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      setDarkMode(false);
      localStorage.setItem("theme", "light");
    }
  }, []);

  const menuItems = [

  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isHomeNavStyle
          ? 'w-full border-b border-white/[0.06] shadow-none'
          : scrolled
            ? 'mx-3 sm:mx-5 mt-3 rounded-2xl shadow-lg shadow-purple-500/10'
            : 'mx-0 mt-0 rounded-none'
      } ${isHomeNavStyle ? 'navbar-home navbar-home-magdy' : ''}`}
      style={
        isHomeNavStyle
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
      {!isHomeNavStyle && (
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] ${scrolled ? 'rounded-t-2xl' : ''}`}
          style={{ background: 'linear-gradient(90deg, #8B5CF6, #6C2BD9, #5B21B6)' }}
        />
      )}

      <div
        className={`max-w-7xl mx-auto mobile-menu-container ${isHomeNavStyle ? 'px-4 sm:px-8 lg:px-10' : 'px-3 sm:px-6 lg:px-8'}`}
      >
        <div className="flex justify-between items-center gap-3 h-16 md:h-[4.5rem] min-w-0">

          {/* شعار — على الرئيسية: MAGDY ACADEMY نص فقط */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group shrink min-w-0"
          >
            {!isHomeNavStyle && (
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
            {isHomeNavStyle && (
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
              <div className={`flex items-center ${isHomeNavStyle ? 'gap-2 sm:gap-4 md:gap-5' : 'gap-2'}`}>
                {isHomeNavStyle ? (
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
                  aria-label="فتح القائمة الجانبية"
                  onClick={toggleMenu}
                  className={`md:hidden relative p-2.5 rounded-xl transition-all duration-300 group shrink-0 ${
                    isHomeNavStyle ? 'bg-white/10' : ''
                  }`}
                  style={isHomeNavStyle ? undefined : { backgroundColor: 'rgba(108, 43, 217, 0.1)' }}
                >
                  <FaBars
                    className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                    style={{ color: isHomeNavStyle ? '#ffffff' : '#6C2BD9' }}
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
      </div>
    </nav>
  );
}
