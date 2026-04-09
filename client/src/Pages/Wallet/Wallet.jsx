import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import {
    getWalletBalance,
    rechargeWallet,
    getTransactionHistory,
    validateRechargeCode,
    clearWalletError
} from "../../Redux/Slices/WalletSlice";
import { getPaymentServices } from "../../Redux/Slices/WhatsAppServiceSlice";
import { formatCairoDate } from "../../utils/timezone";
import { PAYMENT } from "../../Constants/LayoutConfig";
import {
    FaWallet,
    FaCreditCard,
    FaHistory,
    FaPlus,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaWhatsapp,
    FaClock,
    FaGlobe
} from "react-icons/fa";

/* ─── colour tokens ─────────────────────────────────────────────────── */
const PAGE_BG  = '#0C1325';
const CARD_BG  = '#162040';
const CARD_BDR = 'rgba(255,255,255,0.07)';
const DIVIDER  = 'rgba(255,255,255,0.06)';

export default function Wallet() {
    const dispatch = useDispatch();
    const { data: user } = useSelector((state) => state.auth);
    const {
        balance, transactions, loading, error,
        rechargeLoading, rechargeError, codeValidation
    } = useSelector((state) => state.wallet);
    const { services: whatsappServices } = useSelector((state) => state.whatsappService);

    const [rechargeForm, setRechargeForm] = useState({ code: "", amount: "" });
    const [showAmount, setShowAmount] = useState(false);
    const [activeTab, setActiveTab] = useState("balance");

    useEffect(() => {
        if (user) {
            dispatch(getWalletBalance());
            dispatch(getTransactionHistory());
            dispatch(getPaymentServices());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (error)        { toast.error(error);        dispatch(clearWalletError()); }
        if (rechargeError){ toast.error(rechargeError); dispatch(clearWalletError()); }
    }, [error, rechargeError, dispatch]);

    const handleRechargeFormChange = (e) => {
        const { name, value } = e.target;
        setRechargeForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCodeValidation = async (code) => {
        if (code.length >= 6) await dispatch(validateRechargeCode({ code }));
    };

    const handleRecharge = async (e) => {
        e.preventDefault();
        if (!rechargeForm.code || !rechargeForm.amount) { toast.error("يرجى ملء جميع الحقول"); return; }
        const amount = parseFloat(rechargeForm.amount);
        if (isNaN(amount) || amount <= 0) { toast.error("يرجى إدخال مبلغ صحيح"); return; }
        try {
            await dispatch(rechargeWallet({ code: rechargeForm.code, amount })).unwrap();
            toast.success("تم شحن المحفظة بنجاح!");
            setRechargeForm({ code: "", amount: "" });
            dispatch(getWalletBalance());
        } catch (_) { /* handled in useEffect */ }
    };

    const formatDate = (dateString) =>
        formatCairoDate(dateString, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const getTransactionMeta = (type) => {
        switch (type) {
            case 'recharge': return { icon: <FaArrowUp />,        color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'شحن' };
            case 'purchase': return { icon: <FaArrowDown />,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'شراء' };
            case 'refund':   return { icon: <FaArrowUp />,         color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'استرداد' };
            default:         return { icon: <FaMoneyBillWave />,   color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'معاملة' };
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'مكتمل' };
            case 'pending':   return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'قيد الانتظار' };
            case 'failed':    return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'فشل' };
            default:          return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: status };
        }
    };

    /* ── shared input style ────────────────────────────────────────── */
    const inputCls = "block w-full px-4 py-3 rounded-xl text-white placeholder-white/30 text-sm outline-none transition-all focus:ring-2";
    const inputStyle = {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: `1px solid ${CARD_BDR}`,
    };

    /* ── sub-card style ────────────────────────────────────────────── */
    const subCard = {
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: `1px solid ${DIVIDER}`,
        borderRadius: '0.75rem',
        padding: '1.25rem',
    };

    return (
        <Layout mainClassName="min-h-[100vh] bg-[#0C1325]">
            <div className="min-h-screen bg-[#0C1325] py-8" dir="rtl">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">

                    {/* ── Page Header ──────────────────────────────── */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                                style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
                                <FaWallet className="text-sm" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary">
                                محفظتي
                            </h1>
                        </div>
                        <p className="text-sm mr-[52px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            إدارة رصيدك وعرض سجل المعاملات
                        </p>
                    </div>

                    {/* ── Balance Card ──────────────────────────────── */}
                    <div className="rounded-2xl p-6 mb-6"
                        style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>الرصيد الحالي</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl sm:text-4xl font-bold"
                                        style={{ color: 'var(--color-primary-light)' }}>
                                        {showAmount ? `${balance?.toFixed(2)} جنيه` : "**** جنيه"}
                                    </span>
                                    <button
                                        onClick={() => setShowAmount(!showAmount)}
                                        className="p-2 rounded-lg transition-colors"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                                    >
                                        {showAmount ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>إجمالي المعاملات</p>
                                <p className="text-3xl font-bold text-white">{transactions.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ──────────────────────────────────────── */}
                    <div className="flex gap-2 mb-6">
                        {[
                            { id: 'balance', icon: <FaCreditCard />, label: 'شحن المحفظة' },
                            { id: 'history', icon: <FaHistory />,    label: 'سجل المعاملات' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                                style={activeTab === tab.id
                                    ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                                    : { backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}`, color: 'rgba(255,255,255,0.5)' }
                                }
                            >
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab Content ───────────────────────────────── */}
                    <div className="rounded-2xl overflow-hidden"
                        style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>

                        {/* card header bar */}
                        <div className="px-6 py-4 flex items-center gap-3"
                            style={{ borderBottom: `1px solid ${DIVIDER}` }}>
                            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                            <h2 className="text-base font-semibold text-white">
                                {activeTab === 'balance' ? 'شحن محفظتك' : 'سجل المعاملات'}
                            </h2>
                        </div>

                        {/* ── RECHARGE TAB ─────────────────────────── */}
                        {activeTab === "balance" && (
                            <div className="p-6 space-y-6">

                                {/* Instructions */}
                                <div className="rounded-xl p-5 space-y-4"
                                    style={{ backgroundColor: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    <h4 className="font-semibold text-white flex items-center gap-2">
                                        <FaCheckCircle style={{ color: '#10b981' }} />
                                        {PAYMENT.sectionTitle}
                                    </h4>
                                    <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                        {PAYMENT.steps.map((step, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span style={{ color: '#10b981' }}>•</span>
                                                <span>{i === 0 ? step.replace('01555559887', '') : step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* WhatsApp Contact */}
                                <div className="rounded-xl p-5"
                                    style={{ backgroundColor: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.2)' }}>
                                    <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <FaWhatsapp style={{ color: '#25D366', fontSize: '1.1rem' }} />
                                        {PAYMENT.whatsappForCodes.label}
                                    </h5>
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl p-4"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${DIVIDER}` }}>
                                        <div className="text-center sm:text-right">
                                            <p className="font-bold text-white">{PAYMENT.whatsappContact.label}</p>
                                            <p className="text-xl font-bold my-1" dir="ltr" style={{ color: '#25D366' }}>
                                                {PAYMENT.whatsappContact.phone}
                                            </p>
                                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                {PAYMENT.whatsappContact.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const message = "مرحباً! اريد شحن المحفظة";
                                                window.open(`https://wa.me/2${PAYMENT.whatsappContact.phone}?text=${encodeURIComponent(message)}`, '_blank');
                                            }}
                                            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
                                            style={{ backgroundColor: '#25D366' }}
                                        >
                                            <FaWhatsapp className="text-lg" /> تواصل الآن
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Vodafone Cash */}
                                    <div style={subCard}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
                                                <FaCreditCard style={{ color: '#ef4444' }} />
                                            </div>
                                            <h6 className="font-bold text-white">{PAYMENT.vodafoneCash.label}</h6>
                                        </div>
                                        <div className="text-center py-3 rounded-lg"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${DIVIDER}` }}>
                                            <p className="text-xl font-bold text-white tracking-wider" dir="ltr">
                                                {PAYMENT.vodafoneCash.phone}
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: '#10b981' }}>
                                                {PAYMENT.vodafoneCash.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* InstaPay */}
                                    <div style={subCard}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: 'rgba(139,92,246,0.15)' }}>
                                                <FaCreditCard style={{ color: 'var(--color-primary-light)' }} />
                                            </div>
                                            <h6 className="font-bold text-white">{PAYMENT.instaPay.label}</h6>
                                        </div>
                                        <div className="text-center py-3 rounded-lg"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${DIVIDER}` }}>
                                            <p className="text-xl font-bold text-white tracking-wider" dir="ltr">
                                                {PAYMENT.instaPay.phone}
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                تحويل لحظي
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Misr */}
                                <div style={subCard}>
                                    <h6 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-1 h-5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></span>
                                        {PAYMENT.bankMisr.label}
                                    </h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { label: 'اسم المستفيد', value: PAYMENT.bankMisr.accountName, dir: 'rtl' },
                                            { label: 'رقم الحساب',   value: PAYMENT.bankMisr.accountNumber, dir: 'ltr' },
                                        ].map((item, i) => (
                                            <div key={i} className="p-3 rounded-lg"
                                                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${DIVIDER}` }}>
                                                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
                                                <p className="font-bold text-white select-all" dir={item.dir}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Saudi Payment */}
                                <div style={subCard}>
                                    <h6 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-1 h-5 rounded-full bg-emerald-500"></span>
                                        {PAYMENT.saudiPayment.label}
                                    </h6>
                                    <div className="space-y-3">
                                        {/* Bank Misr IBAN */}
                                        <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${DIVIDER}` }}>
                                            <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                                <p className="font-bold text-white text-sm">{PAYMENT.saudiPayment.bankMisrIban.label}</p>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>اسم المستفيد</p>
                                                    <p className="font-semibold text-white">{PAYMENT.saudiPayment.bankMisrIban.accountName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>IBAN</p>
                                                    <p className="font-mono font-semibold text-white select-all break-all text-sm px-2 py-1 rounded"
                                                        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} dir="ltr">
                                                        {PAYMENT.saudiPayment.bankMisrIban.iban}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Rajhi Bank */}
                                        <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${DIVIDER}` }}>
                                            <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
                                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                <p className="font-bold text-white text-sm">{PAYMENT.saudiPayment.rajhiBank.label}</p>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>اسم المستفيد</p>
                                                    <p className="font-semibold text-white">{PAYMENT.saudiPayment.rajhiBank.accountName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>رقم الحساب</p>
                                                    <p className="font-mono font-semibold text-white select-all text-sm px-2 py-1 rounded"
                                                        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} dir="ltr">
                                                        {PAYMENT.saudiPayment.rajhiBank.accountNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* International */}
                                <div className="text-center p-4 rounded-xl text-sm font-medium"
                                    style={{ backgroundColor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(147,197,253,0.9)' }}>
                                    <FaGlobe className="inline-block ml-2" />
                                    {PAYMENT.internationalPayment.label}
                                </div>

                                {/* WhatsApp Support */}
                                {whatsappServices && whatsappServices.length > 0 && (
                                    <div className="rounded-xl p-5"
                                        style={{ backgroundColor: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.18)' }}>
                                        <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
                                            <FaWhatsapp style={{ color: '#25D366' }} />
                                            تحتاج مساعدة؟ تواصل معنا على واتساب
                                        </h5>
                                        <div className="space-y-4">
                                            {whatsappServices.map((service) => (
                                                <div key={service._id} className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{service.icon}</span>
                                                        <h6 className="font-medium text-white">{service.name}</h6>
                                                    </div>
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{service.description}</p>
                                                    {service.whatsappNumbers.map((number, idx) => (
                                                        <div key={number._id || idx}
                                                            className="flex items-center justify-between p-3 rounded-xl"
                                                            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${DIVIDER}` }}>
                                                            <div>
                                                                <p className="font-medium text-white">{number.name}</p>
                                                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{number.number}</p>
                                                                {number.workingHours && (
                                                                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                                        <FaClock className="text-[10px]" />{number.workingHours}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    const msg = `مرحباً! أنا مهتم بخدمة ${service.name}. ${service.instructions || ''}`;
                                                                    window.open(`https://wa.me/${number.number}?text=${encodeURIComponent(msg)}`, '_blank');
                                                                }}
                                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                                                                style={{ backgroundColor: '#25D366' }}
                                                            >
                                                                <FaWhatsapp />تواصل
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)' }}>
                                            <strong className="text-white">ساعات العمل:</strong> الدعم متاح على مدار 24/7
                                        </p>
                                    </div>
                                )}

                                {/* Recharge Form */}
                                <form onSubmit={handleRecharge} className="space-y-4 pt-2">
                                    <div className="w-1 h-px w-full" style={{ backgroundColor: DIVIDER }} />
                                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                                        أدخل كود الشحن
                                    </h3>

                                    {/* Code */}
                                    <div>
                                        <label className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>كود الشحن</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="code"
                                                value={rechargeForm.code}
                                                onChange={(e) => { handleRechargeFormChange(e); handleCodeValidation(e.target.value); }}
                                                className={inputCls}
                                                style={{ ...inputStyle, focusRingColor: 'var(--color-primary)' }}
                                                placeholder="أدخل كود الشحن الخاص بك"
                                                required
                                            />
                                            {rechargeForm.code && (
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                    {codeValidation.isValid  ? <FaCheckCircle className="text-emerald-400 w-5 h-5" /> :
                                                     codeValidation.error    ? <FaTimesCircle className="text-red-400 w-5 h-5" /> :
                                                     codeValidation.loading  ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" /> :
                                                     <FaExclamationTriangle className="text-yellow-400 w-5 h-5" />}
                                                </div>
                                            )}
                                        </div>
                                        {codeValidation.error && <p className="text-red-400 text-xs mt-1">{codeValidation.error}</p>}
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>المبلغ (جنيه)</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={rechargeForm.amount}
                                            onChange={handleRechargeFormChange}
                                            className={inputCls}
                                            style={inputStyle}
                                            placeholder="أدخل المبلغ بالجنيه"
                                            min="1"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={rechargeLoading || !codeValidation.isValid}
                                        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed btn-primary"
                                    >
                                        {rechargeLoading ? (
                                            <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />جاري المعالجة...</>
                                        ) : (
                                            <><FaPlus />شحن المحفظة</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ── HISTORY TAB ───────────────────────────── */}
                        {activeTab === "history" && (
                            <div className="p-6">
                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="w-10 h-10 rounded-full animate-spin"
                                            style={{ border: '3px solid var(--color-primary)', borderTopColor: 'transparent' }} />
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                            <FaHistory className="text-2xl" style={{ color: 'rgba(255,255,255,0.3)' }} />
                                        </div>
                                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            لم يتم العثور على معاملات. ابدأ بشحن محفظتك!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {transactions.map((tx, idx) => {
                                            const meta   = getTransactionMeta(tx.type);
                                            const status = getStatusStyle(tx.status);
                                            const isCredit = tx.type === 'recharge' || tx.type === 'refund';
                                            return (
                                                <div key={idx}
                                                    className="flex items-center justify-between p-4 rounded-xl transition-all"
                                                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${DIVIDER}` }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                                                            style={{ backgroundColor: meta.bg, color: meta.color }}>
                                                            {meta.icon}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white text-sm">{tx.description}</p>
                                                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                                الكود: {tx.code}
                                                            </p>
                                                            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                                <FaCalendarAlt className="text-[9px]" />{formatDate(tx.date)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-left flex flex-col items-end gap-1.5">
                                                        <p className="font-bold text-lg"
                                                            style={{ color: isCredit ? '#10b981' : '#ef4444' }}>
                                                            {isCredit ? '+' : '-'}{Math.abs(tx.amount).toFixed(2)} جنيه
                                                        </p>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                            style={{ backgroundColor: status.bg, color: status.color }}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
