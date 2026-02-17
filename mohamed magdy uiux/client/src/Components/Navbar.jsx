import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaBars, FaHome, FaUser, FaGraduationCap, FaBlog, FaQuestionCircle, FaSignOutAlt, FaPlus, FaList, FaInfoCircle, FaPhone, FaHistory } from "react-icons/fa";
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
    const drawerToggle = document.getElementById('sidebar-drawer');
    if (drawerToggle) {
      drawerToggle.checked = !drawerToggle.checked;
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
    const element = document.querySelector("html");
    element.classList.remove("light", "dark");
    if (darkMode) {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      element.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

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

  const menuItems = [

  ];

  const adminMenuItems = [
    { name: "لوحة التحكم", path: "/admin", icon: FaUser },
    { name: "إدارة المستخدمين", path: "/admin/users", icon: FaUser },
    { name: "إدارة المدونة", path: "/admin/blogs", icon: FaBlog },
    { name: "إدارة الأسئلة والأجوبة", path: "/admin/qa", icon: FaQuestionCircle },
    { name: "إدارة المواد", path: "/admin/subjects", icon: FaGraduationCap },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700">

      {/* Gradient Line at Top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] navbar-accent-line"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo Section */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Logo Container */}
              <div className="relative rounded-xl group-hover:shadow-xl transition-all duration-300">
                <img
                  src={logo2}
                  alt="logo"
                  className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Brand Name - Hidden on Mobile */}
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold text-gradient-primary">
                {BRAND.teacherName}
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-1">{BRAND.platformName}</p>
            </div>
            {/* Theme Toggle - Modern Switch */}
            <button
              onClick={toggleDarkMode}
              className="relative w-14 h-7 ml-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 transition-all duration-500 shadow-inner border border-gray-300/50 dark:border-gray-600/50 group overflow-hidden"
              aria-label="Toggle dark mode"
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 transition-opacity duration-500 ${darkMode ? 'opacity-100' : 'opacity-0'}`}></div>

              {/* Toggle Circle */}
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg border border-gray-200 dark:border-gray-600 transition-all duration-500 flex items-center justify-center ${darkMode ? 'left-7 bg-primary' : 'left-0.5 bg-accent'
                }`}>
                {darkMode ? (
                  <FaMoon className="w-3 h-3 text-white" />
                ) : (
                  <FaSun className="w-3 h-3 text-primary" />
                )}
              </div>
            </button>
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
          <div className="flex items-center gap-2 md:gap-3">



            {/* Auth Buttons - Not Logged In */}
            {!user?.fullName && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 bg-white/50 dark:bg-gray-800/50 hover:bg-primary/10"
                >
                  <FaUser className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                  <span className="sm:hidden">دخول</span>
                </Link>

                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <FaPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">حساب جديد</span>
                  <span className="sm:hidden">حساب جديد</span>
                </Link>

                {/* Mobile Menu Button for Guests */}
                <button
                  onClick={toggleMenu}
                  className="md:hidden relative p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-300 border border-primary/30 dark:border-primary/50 group"
                >
                  <FaBars className="w-4 h-4 text-primary dark:text-primary-light transition-transform duration-300 group-hover:rotate-90" />
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

        {/* Mobile Menu */}
        <div
          className={`md:hidden mobile-menu-container transition-all duration-500 ease-in-out overflow-hidden ${isMenuOpen ? "max-h-screen opacity-100 visible" : "max-h-0 opacity-0 invisible"
            }`}
        >
          <div className="py-6 space-y-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl">
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
            {!user && (
              <>
                {/* Special Navigation for Guests */}
                <div className="space-y-1 px-2 pb-3">
                  <p className="px-4 pb-2 text-xs font-bold text-green-600 dark:text-green-400 uppercase">تصفح المحتوى</p>

                  {/* الكورسات */}
                  <Link
                    to="/courses"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/courses'
                      ? "text-green-600 dark:text-green-400 bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-900/30 dark:to-amber-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${location.pathname === '/courses'
                      ? "bg-green-200 dark:bg-green-800/50"
                      : "bg-gray-200 dark:bg-gray-700"
                      }`}>
                      <FaGraduationCap className="w-4 h-4" />
                    </div>
                    <span>الكورسات</span>
                  </Link>

                  {/* المدونة */}
                  <Link
                    to="/blogs"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/blogs'
                      ? "text-green-600 dark:text-green-400 bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-900/30 dark:to-amber-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${location.pathname === '/blogs'
                      ? "bg-green-200 dark:bg-green-800/50"
                      : "bg-gray-200 dark:bg-gray-700"
                      }`}>
                      <FaBlog className="w-4 h-4" />
                    </div>
                    <span>المدونة</span>
                  </Link>

                  {/* الأسئلة والأجوبة */}
                  <Link
                    to="/qa"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/qa'
                      ? "text-green-600 dark:text-green-400 bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-900/30 dark:to-amber-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${location.pathname === '/qa'
                      ? "bg-green-200 dark:bg-green-800/50"
                      : "bg-gray-200 dark:bg-gray-700"
                      }`}>
                      <FaQuestionCircle className="w-4 h-4" />
                    </div>
                    <span>الأسئلة والأجوبة</span>
                  </Link>
                </div>

                {/* Login/Signup Buttons */}
                <div className="space-y-3 px-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-green-500 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    <FaUser className="w-4 h-4" />
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                  >
                    <FaPlus className="w-4 h-4" />
                    إنشاء حساب جديد
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
