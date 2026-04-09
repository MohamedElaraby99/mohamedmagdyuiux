import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/Slices/AuthSlice";
import { getWalletBalance } from "../Redux/Slices/WalletSlice";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUserCircle,
  FaPlus,
  FaList,
  FaInfoCircle,
  FaBlog,
  FaQuestionCircle,
  FaWallet,
  FaHistory,
  FaChevronDown,
  FaChevronUp,
  FaVideo,
  FaClipboardCheck,
  FaUserSecret,
  FaUser,
  FaQuoteRight,
  FaTimes,
} from "react-icons/fa";
import { BRAND } from "../Constants/LayoutConfig";

export default function Sidebar({ hideBar = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const { isLoggedIn, role, data } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);

  // Fetch wallet balance when user is logged in
  useEffect(() => {
    if (isLoggedIn && !["ADMIN", "SUPER_ADMIN"].includes(role)) {
      dispatch(getWalletBalance());
    }
  }, [dispatch, isLoggedIn, role]);

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
      drawerToggle.dispatchEvent(new Event('change', { bubbles: true }));
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

  const pathActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/admin/dashboard")
      return location.pathname.startsWith("/admin");
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const sidebarNavClass = (path) =>
    `flex gap-3 items-center rounded-xl px-3 py-2.5 text-sm transition-all text-right border ${
      pathActive(path)
        ? "border-[#A5A6FF]/30 bg-white/[0.07] text-[#d8d9ff]"
        : "border-transparent text-slate-300 hover:border-white/[0.06] hover:bg-white/[0.05] hover:text-white"
    }`;

  const sidebarIconClass = (path) =>
    pathActive(path) ? "text-[#A5A6FF]" : "text-slate-400";

  return (
    <>
      <div className="drawer drawer-end">
        <input className="drawer-toggle" id="sidebar-drawer" type="checkbox" />
        <div className="drawer-side" style={{ zIndex: 9999 }}>
          {/* DaisyUI drawer overlay (hidden) */}
          <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
          <div
            className="flex min-h-[100dvh] w-[min(100vw,20rem)] flex-col bg-[#080E1E] font-['Almarai'] text-slate-200 shadow-2xl border-l border-white/[0.08]"
            style={{ zIndex: 10000 }}
            dir="rtl"
          >
            {/* Header — نص مثل الهيدر بدون لوجو */}
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 pb-4 pt-5">
              <Link
                to="/"
                onClick={closeSidebar}
                className="min-w-0 flex-1 text-right"
              >
                <span className="block font-sans text-sm font-bold uppercase tracking-[0.08em] text-white sm:text-base">
                  {BRAND.navbarWordmark || "MAGDY ACADEMY"}
                </span>
                <span className="mt-1 block text-[10px] text-slate-400">
                  {BRAND.platformName}
                </span>
              </Link>
              <button
                type="button"
                onClick={closeSidebar}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/[0.15]"
                aria-label="إغلاق القائمة"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4 pt-4">
            {/* Super Admin Status Banner */}
            {role === "SUPER_ADMIN" && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600/90 to-pink-600/90 p-3 text-white shadow-lg">
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
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-600/90 via-green-600/90 to-teal-700/90 p-3 text-white shadow-md">
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
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className={sidebarNavClass("/")} onClick={closeSidebar}>
                  <FaHome size={16} className={sidebarIconClass("/")} />
                  الرئيسية
                </Link>
              </li>

              <li>
                <Link to="/courses" className={sidebarNavClass("/courses")} onClick={closeSidebar}>
                  <FaList size={16} className={sidebarIconClass("/courses")} />
                  {isLoggedIn && (role === "ADMIN" || role === "SUPER_ADMIN")
                    ? "جميع الكورسات "
                    : isLoggedIn
                      ? "كورساتي"
                      : "الكورسات"}
                </Link>
              </li>

              <li>
                <Link to="/blogs" className={sidebarNavClass("/blogs")} onClick={closeSidebar}>
                  <FaBlog size={16} className={sidebarIconClass("/blogs")} />
                  المدونة
                </Link>
              </li>

              <li>
                <Link to="/qa" className={sidebarNavClass("/qa")} onClick={closeSidebar}>
                  <FaQuestionCircle size={16} className={sidebarIconClass("/qa")} />
                  المنتدى
                </Link>
              </li>

              {isLoggedIn && (
                <>
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <li>
                      <Link
                        to="/admin/dashboard"
                        className={sidebarNavClass("/admin/dashboard")}
                        onClick={closeSidebar}
                      >
                        <FaUserCircle size={16} className={sidebarIconClass("/admin/dashboard")} />
                        لوحة تحكم الإدارة
                      </Link>
                    </li>
                  )}

                  {!["ADMIN", "SUPER_ADMIN"].includes(role) && (
                    <li>
                      <Link to="/wallet" className={sidebarNavClass("/wallet")} onClick={closeSidebar}>
                        <FaWallet size={16} className={sidebarIconClass("/wallet")} />
                        محفظتي
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/exam-history" className={sidebarNavClass("/exam-history")} onClick={closeSidebar}>
                      <FaHistory size={16} className={sidebarIconClass("/exam-history")} />
                      سجل الامتحانات
                    </Link>
                  </li>
                  <li>
                    <Link to="/live-meetings" className={sidebarNavClass("/live-meetings")} onClick={closeSidebar}>
                      <FaVideo size={16} className={sidebarIconClass("/live-meetings")} />
                      الجلسات المباشرة
                    </Link>
                  </li>

                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <li>
                      <button
                        type="button"
                        onClick={toggleAdminDropdown}
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-transparent px-3 py-2.5 text-right text-sm text-slate-300 transition-all hover:border-white/[0.06] hover:bg-white/[0.05] hover:text-white"
                      >
                        <div className="flex items-center gap-3">
                          <FaInfoCircle size={16} className="text-slate-400" />
                          خدمات الإدارة
                        </div>
                        {adminDropdownOpen ? (
                          <FaChevronUp size={12} className="text-slate-400" />
                        ) : (
                          <FaChevronDown size={12} className="text-slate-400" />
                        )}
                      </button>

                      {adminDropdownOpen && (
                        <ul className="mr-4 mt-2 space-y-1 rounded-xl border border-white/[0.06] bg-[#0c1428] p-2">
                          <li>
                            <Link
                              to="/admin/blog-dashboard"
                              className="flex gap-2 rounded-lg px-2 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                              onClick={closeSidebar}
                            >
                              <FaBlog size={14} className="mt-0.5 shrink-0 text-[#A5A6FF]" />
                              إدارة المدونة
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/pending-tasks"
                              className="flex gap-2 rounded-lg px-2 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                              onClick={closeSidebar}
                            >
                              <FaClipboardCheck size={14} className="mt-0.5 shrink-0 text-[#A5A6FF]" />
                              تقييم مهام الطلاب
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/qa-dashboard"
                              className="flex gap-2 rounded-lg px-2 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                              onClick={closeSidebar}
                            >
                              <FaQuestionCircle size={14} className="mt-0.5 shrink-0 text-[#A5A6FF]" />
                              إدارة الأسئلة والأجوبة
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/live-meetings"
                              className="flex gap-2 rounded-lg px-2 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                              onClick={closeSidebar}
                            >
                              <FaVideo size={14} className="mt-0.5 shrink-0 text-[#A5A6FF]" />
                              إدارة الجلسات المباشرة
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/admin/testimonials"
                              className="flex gap-2 rounded-lg px-2 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                              onClick={closeSidebar}
                            >
                              <FaQuoteRight size={14} className="mt-0.5 shrink-0 text-[#A5A6FF]" />
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
            </div>

            {/* User Section */}
            <div className="shrink-0 border-t border-white/[0.08] px-4 pb-5 pt-4">
              {isLoggedIn ? (
                <div className="flex w-full flex-col items-center justify-center gap-3">
                  <Link
                    to="/user/profile"
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-r from-[#6C2BD9] to-[#7C3AED] text-xs font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:border-white/30"
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

                  <div className="text-center">
                    <div className="text-sm font-semibold text-white">
                      {data?.fullName || "User"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {role === "SUPER_ADMIN" ? "مدير مميز" : role === "ADMIN" ? "مدير" : "طالب"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onLogout}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
                  </button>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-3 px-0.5">
                  <Link
                    to="/signup"
                    onClick={closeSidebar}
                    className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-[#0a0f1a] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: "#A5A6FF",
                      boxShadow:
                        "0 0 24px rgba(165, 166, 255, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <FaPlus className="h-4 w-4" />
                    سجل الآن
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeSidebar}
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#A5A6FF] bg-transparent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A5A6FF]/10"
                  >
                    <FaUser className="h-4 w-4" />
                    تسجيل الدخول
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
