import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserData, updateUserData } from "../../Redux/Slices/AuthSlice";
import {
  FaUserCircle, FaPhone, FaMapMarkerAlt, FaUser,
  FaEdit, FaSave, FaTimes, FaCamera, FaLock, FaShieldAlt
} from "react-icons/fa";
import { IoIosLock, IoIosRefresh } from "react-icons/io";
import { FiMoreVertical } from "react-icons/fi";
import Layout from "../../Layout/Layout";
import { useNavigate } from "react-router-dom";
import { egyptianCities, getArabicCity } from "../../utils/governorateMapping";
import UserQRCode from "../../Components/UserQRCode";

/* ─── colour tokens ─────────────────────────────────────────────────── */
const PAGE_BG  = '#0C1325';
const CARD_BG  = '#162040';
const CARD_BDR = 'rgba(255,255,255,0.07)';
const DIVIDER  = 'rgba(255,255,255,0.06)';

export default function Profile() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const userData  = useSelector((state) => state.auth.data);

  const [isUpdating, setIsUpdating]   = useState(false);
  const [isEditing,  setIsEditing]    = useState(false);
  const [isChanged,  setIschanged]    = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userInput,  setUserInput]    = useState({
    name:              userData?.fullName        || "",
    fatherPhoneNumber: userData?.fatherPhoneNumber || "",
    governorate:       userData?.governorate     || "",
    age:               userData?.age             || "",
    avatar:        null,
    previewImage:  null,
    userId:        null,
  });

  const avatarInputRef = useRef(null);

  /* ── sync userData → form ──────────────────────────────────────── */
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setUserInput(prev => ({
        ...prev,
        name:              userData?.fullName          || "",
        fatherPhoneNumber: userData?.fatherPhoneNumber || "",
        governorate:       userData?.governorate       || "",
        age:               userData?.age               || "",
        userId:            userData?._id,
      }));
    }
  }, [userData]);

  useEffect(() => {
    if (Object.keys(userData).length < 1) dispatch(getUserData());
  }, []);

  /* ── detect changes (name + avatar only) ──────────────────────── */
  useEffect(() => {
    if (!isEditing) { setIschanged(false); return; }
    const changed = userInput.name !== userData?.fullName || !!userInput.avatar;
    setIschanged(changed);
  }, [userInput, userData, isEditing]);

  function handleImageUpload(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", function () {
      setUserInput(prev => ({ ...prev, previewImage: this.result, avatar: file }));
    });
  }

  async function onFormSubmit(e) {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("fullName", userInput.name);
    // phone number is intentionally NOT sent — read-only
    if (userInput.avatar) formData.append("avatar", userInput.avatar);
    const res = await dispatch(updateUserData({ formData, id: userInput.userId }));
    if (res?.payload?.success) {
      await dispatch(getUserData());
      setIschanged(false);
      setIsEditing(false);
    }
    setIsUpdating(false);
  }

  function handleEditClick() {
    setIsEditing(true);
    setUserInput(prev => ({
      ...prev,
      name:   userData?.fullName || "",
      avatar: null,
      previewImage: null,
      userId: userData?._id,
    }));
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setIschanged(false);
    setUserInput(prev => ({
      ...prev,
      name:         userData?.fullName || "",
      avatar:       null,
      previewImage: null,
    }));
  }

  /* ── shared input style ────────────────────────────────────────── */
  const readonlyStyle = {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: `1px solid ${DIVIDER}`,
    color: 'rgba(255,255,255,0.4)',
    cursor: 'not-allowed',
  };
  const editableStyle = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: `1px solid rgba(255,255,255,0.15)`,
    color: '#fff',
  };

  const avatarSrc = userInput.previewImage || userData?.avatar?.secure_url;

  return (
    <Layout mainClassName="min-h-[100vh] bg-[#0C1325]" hideFooter>
      <div className="min-h-screen bg-[#0C1325] py-8 px-4" dir="rtl">
        <div className="max-w-2xl mx-auto">

          {/* ── Page Header ──────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
                <FaUser className="text-sm" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary">
                الملف الشخصي
              </h1>
            </div>
            <p className="text-sm mr-[52px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              إدارة معلوماتك الشخصية
            </p>
          </div>

          <form autoComplete="off" noValidate onSubmit={onFormSubmit}>

            {/* ── Avatar + Name Card ───────────────────────────── */}
            <div className="rounded-2xl p-6 mb-4"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>

              <div className="flex items-center gap-5 mb-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-full overflow-hidden cursor-pointer ring-2 ring-offset-2 ring-offset-[#162040] transition-all"
                    style={{ ringColor: 'var(--color-primary)' }}
                    onClick={() => isEditing && avatarInputRef.current.click()}
                  >
                    {avatarSrc
                      ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                          <FaUserCircle className="w-full h-full" style={{ color: 'rgba(255,255,255,0.3)' }} />
                        </div>
                    }
                  </div>
                  {isEditing && (
                    <button type="button" onClick={() => avatarInputRef.current.click()}
                      className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:opacity-90"
                      style={{ backgroundColor: 'var(--color-primary)' }}>
                      <FaCamera className="text-xs" />
                    </button>
                  )}
                  <input type="file" accept=".png,.jpeg,.jpg" className="hidden"
                    ref={avatarInputRef} onChange={handleImageUpload} />
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-lg truncate">{userData?.fullName || "—"}</p>
                  <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {userData?.email || ""}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-primary-light)' }}>
                    {userData?.role === 'ADMIN' || userData?.role === 'SUPER_ADMIN' ? 'مدير' : 'طالب'}
                  </span>
                </div>

                {/* Options menu */}
                <div className="relative flex-shrink-0">
                  <button type="button"
                    onClick={() => setIsDialogOpen(p => !p)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
                    <FiMoreVertical size={16} />
                  </button>
                  {isDialogOpen && (
                    <div className="absolute left-0 top-10 z-10 rounded-xl overflow-hidden shadow-2xl min-w-[180px]"
                      style={{ backgroundColor: '#1e2d50', border: `1px solid ${CARD_BDR}` }}>
                      <button type="button"
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white transition-colors text-right"
                        style={{ borderBottom: `1px solid ${DIVIDER}` }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => { navigate("change-password"); setIsDialogOpen(false); }}>
                        <IoIosLock style={{ color: 'var(--color-primary-light)' }} />تغيير كلمة المرور
                      </button>
                      <button type="button"
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 transition-colors text-right"
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => { navigate("reset-password"); setIsDialogOpen(false); }}>
                        <IoIosRefresh />إعادة تعيين كلمة المرور
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Section header */}
              <div className="flex items-center justify-between mb-5 pb-4"
                style={{ borderBottom: `1px solid ${DIVIDER}` }}>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                  المعلومات الشخصية
                </h2>
                {!isEditing && (
                  <button type="button" onClick={handleEditClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 active:scale-95 btn-primary">
                    <FaEdit className="text-[10px]" />تعديل
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Name — editable */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-medium"
                    style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FaUser style={{ color: 'var(--color-primary-light)' }} />
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={isEditing ? userInput.name : (userData?.fullName || "")}
                    onChange={e => setUserInput(p => ({ ...p, name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="أدخل اسمك الكامل"
                    dir="rtl"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={isEditing ? editableStyle : readonlyStyle}
                  />
                </div>

                {/* Phone — always locked */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-medium"
                    style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FaPhone style={{ color: 'rgba(255,255,255,0.3)' }} />
                    رقم الهاتف
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                      <FaLock className="text-[8px]" />غير قابل للتعديل
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={userData?.phoneNumber || ""}
                    disabled
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={readonlyStyle}
                  />
                </div>

              </div>

              {/* Action buttons */}
              {isEditing && (
                <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: `1px solid ${DIVIDER}` }}>
                  <button
                    type="submit"
                    disabled={!isChanged || isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed btn-primary active:scale-[0.98]"
                  >
                    {isUpdating
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />جاري الحفظ...</>
                      : <><FaSave className="text-xs" />حفظ التغييرات</>
                    }
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-80 disabled:opacity-40"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: `1px solid ${CARD_BDR}` }}
                  >
                    <FaTimes className="text-xs" />إلغاء
                  </button>
                </div>
              )}
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
}
