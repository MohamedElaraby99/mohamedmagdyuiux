import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaHistory,
  FaClipboardCheck,
  FaGraduationCap,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaBookOpen
} from 'react-icons/fa';
import Layout from '../../Layout/Layout';
import { getUserExamHistory } from '../../Redux/Slices/ExamSlice';

/* ─── colour tokens for the dark navy page ──────────────────────────── */
const PAGE_BG   = '#0C1325';
const CARD_BG   = '#162040';
const CARD_BDR  = 'rgba(255,255,255,0.07)';
const DIVIDER   = 'rgba(255,255,255,0.06)';
const ROW_HOVER = 'rgba(255,255,255,0.03)';

const ExamHistory = () => {
  const dispatch = useDispatch();
  const { data: user } = useSelector(state => state.auth);
  const { examHistory, examHistoryPagination, loading, error } = useSelector(state => state.exam);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(getUserExamHistory({ page: currentPage, limit: 10 }));
    }
  }, [dispatch, user, currentPage]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getScoreColor  = (score) => score >= 70 ? '#10b981' : '#ef4444';
  const getScoreBorder = (score) => score >= 70
    ? 'rgba(16,185,129,0.25)'
    : 'rgba(239,68,68,0.25)';
  const getScoreBgRgba = (score) => score >= 70
    ? 'rgba(16,185,129,0.1)'
    : 'rgba(239,68,68,0.1)';

  const getExamTypeBadge = (examType) =>
    examType === 'training' ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
        style={{ backgroundColor: 'var(--color-primary)' }}>
        <FaClipboardCheck className="text-[9px]" />تدريبي
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-white bg-orange-500">
        <FaGraduationCap className="text-[9px]" />نهائي
      </span>
    );

  const handleViewResult  = (result) => { setSelectedResult(result); setShowResultModal(true); };
  const handlePageChange  = (page)   => setCurrentPage(page);

  const avgScore = examHistory.length > 0
    ? Math.round(examHistory.reduce((s, r) => s + r.score, 0) / examHistory.length) : 0;

  const stats = [
    { label: 'امتحانات التدريب',   value: examHistory.filter(r => r.examType === 'training').length, icon: <FaClipboardCheck />, color: 'var(--color-primary-light)' },
    { label: 'الامتحانات النهائية', value: examHistory.filter(r => r.examType === 'final').length,    icon: <FaGraduationCap />,  color: '#f97316' },
    { label: 'اجتزت بنجاح',        value: examHistory.filter(r => r.passed).length,                  icon: <FaTrophy />,          color: '#10b981' },
    { label: 'متوسط الدرجات',      value: `${avgScore}%`,                                             icon: <FaStar />,            color: 'var(--color-primary-light)' },
  ];

  /* ── "not logged in" guard ─────────────────────────────────────────── */
  if (!user) {
    return (
      <Layout mainClassName="min-h-[100vh] bg-[#0C1325]">
        <div className="min-h-screen flex items-center justify-center bg-[#0C1325]" dir="rtl">
          <div className="text-center rounded-2xl p-10 max-w-sm mx-4"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <FaUser className="text-xl" style={{ color: 'var(--color-primary-light)' }} />
            </div>
            <h1 className="text-lg font-bold text-white mb-2">يرجى تسجيل الدخول</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              يجب عليك تسجيل الدخول لعرض سجل الامتحانات.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── main page ─────────────────────────────────────────────────────── */
  return (
    <Layout mainClassName="min-h-[100vh] bg-[#0C1325]">
      <div className="min-h-screen bg-[#0C1325]" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
                <FaHistory className="text-sm" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary">
                سجل الامتحانات
              </h1>
            </div>
            <p className="text-sm mr-[52px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              استعرض جميع نتائج امتحاناتك وتتبع أدائك
            </p>
          </div>

          {/* ── Stats ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {stats.map((s, i) => (
              <div key={i} className="rounded-xl p-4 sm:p-5 transition-all hover:brightness-110"
                style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] leading-tight truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Results Card ───────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>

            {/* card header */}
            <div className="px-6 py-4 flex items-center gap-3"
              style={{ borderBottom: `1px solid ${DIVIDER}` }}>
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
              <h2 className="text-base font-semibold text-white">نتائج الامتحانات الأخيرة</h2>
            </div>

            {/* ── loading ── */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-11 h-11 rounded-full animate-spin mx-auto mb-4"
                  style={{ border: `3px solid var(--color-primary)`, borderTopColor: 'transparent' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>جاري تحميل سجل الامتحانات...</p>
              </div>

            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                  <FaTimesCircle className="text-2xl text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">خطأ في تحميل النتائج</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{error}</p>
              </div>

            ) : examHistory.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  <FaHistory className="text-2xl text-primary" style={{ color: 'var(--color-primary-light)' }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">لا توجد نتائج بعد</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  لم تقم بأداء أي امتحانات. ابدأ التعلم والمشاركة في الامتحانات!
                </p>
              </div>

            ) : (
              <div>
                {examHistory.map((result, idx) => (
                  <div key={result._id}
                    className="px-4 sm:px-6 py-4 sm:py-5 transition-colors cursor-default"
                    style={{
                      borderBottom: idx < examHistory.length - 1 ? `1px solid ${DIVIDER}` : 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = ROW_HOVER}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

                      {/* exam info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                          {result.examType === 'training'
                            ? <FaClipboardCheck className="text-sm" style={{ color: 'var(--color-primary-light)' }} />
                            : <FaGraduationCap className="text-sm text-orange-400" />
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                              {result.lessonTitle}
                            </h3>
                            {getExamTypeBadge(result.examType)}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                            style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {result.unitTitle && (
                              <span className="flex items-center gap-1">
                                <FaBookOpen className="text-[9px]" />{result.unitTitle}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-[9px]" />
                              <span className="hidden sm:inline">{formatDate(result.createdAt)}</span>
                              <span className="sm:hidden">{new Date(result.createdAt).toLocaleDateString('ar-EG')}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-[9px]" />{result.timeTaken} دقيقة
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* score + actions */}
                      <div className="flex items-center gap-3 mr-12 sm:mr-0">
                        {/* mini counts (desktop) */}
                        <div className="hidden sm:flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          <span className="flex items-center gap-1">
                            <FaCheckCircle className="text-emerald-400" />
                            {result.correctAnswers}/{result.totalQuestions}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaTimesCircle className="text-red-400" />
                            {result.wrongAnswers}
                          </span>
                        </div>

                        {/* score badge */}
                        <div className="text-center px-3 py-2 rounded-xl min-w-[62px]"
                          style={{
                            backgroundColor: getScoreBgRgba(result.score),
                            border: `1px solid ${getScoreBorder(result.score)}`,
                          }}>
                          <div className="text-lg font-bold leading-none"
                            style={{ color: getScoreColor(result.score) }}>
                            {result.score}%
                          </div>
                          <div className="text-[10px] mt-0.5 font-medium"
                            style={{ color: getScoreColor(result.score) }}>
                            {result.passed ? 'ناجح' : 'راسب'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleViewResult(result)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-medium transition-all active:scale-95 btn-primary"
                        >
                          <FaEye className="text-xs" />
                          <span className="hidden sm:inline">التفاصيل</span>
                          <span className="sm:hidden">عرض</span>
                        </button>
                      </div>
                    </div>

                    {/* mobile mini counts */}
                    <div className="sm:hidden mt-2 flex items-center gap-4 text-xs mr-12"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <span className="flex items-center gap-1">
                        <FaCheckCircle className="text-emerald-400" />صحيح: {result.correctAnswers}/{result.totalQuestions}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaTimesCircle className="text-red-400" />خطأ: {result.wrongAnswers}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Pagination ─────────────────────────────────────── */}
            {examHistoryPagination.totalPages > 1 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{ borderTop: `1px solid ${DIVIDER}` }}>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  عرض{' '}
                  <span className="text-white font-medium">
                    {((examHistoryPagination.currentPage - 1) * examHistoryPagination.resultsPerPage) + 1}
                  </span>
                  {' '}–{' '}
                  <span className="text-white font-medium">
                    {Math.min(examHistoryPagination.currentPage * examHistoryPagination.resultsPerPage, examHistoryPagination.totalResults)}
                  </span>
                  {' '}من{' '}
                  <span className="text-white font-medium">{examHistoryPagination.totalResults}</span>
                  {' '}نتيجة
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(examHistoryPagination.currentPage + 1)}
                    disabled={examHistoryPagination.currentPage === examHistoryPagination.totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ border: `1px solid ${CARD_BDR}`, color: 'rgba(255,255,255,0.5)' }}
                  >
                    <FaChevronRight />
                  </button>

                  {Array.from({ length: examHistoryPagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                      style={page === examHistoryPagination.currentPage
                        ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                        : { border: `1px solid ${CARD_BDR}`, color: 'rgba(255,255,255,0.5)' }
                      }
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(examHistoryPagination.currentPage - 1)}
                    disabled={examHistoryPagination.currentPage === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ border: `1px solid ${CARD_BDR}`, color: 'rgba(255,255,255,0.5)' }}
                  >
                    <FaChevronLeft />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Result Detail Modal ─────────────────────────────────── */}
        {showResultModal && selectedResult && (
          <div
            className="fixed inset-0 flex items-center justify-center z-[90] p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
            onClick={(e) => e.target === e.currentTarget && setShowResultModal(false)}
          >
            <div className="rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BDR}` }}>

              {/* modal header */}
              <div className="px-6 py-5 relative"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="absolute left-4 top-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <FaTimes className="text-xs text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    {selectedResult.examType === 'training'
                      ? <FaClipboardCheck className="text-white" />
                      : <FaGraduationCap className="text-white" />
                    }
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{selectedResult.lessonTitle}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {selectedResult.examType === 'training' ? 'امتحان تدريبي' : 'امتحان نهائي'}
                      {selectedResult.unitTitle && ` · ${selectedResult.unitTitle}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* modal body */}
              <div className="p-6">
                {/* big score */}
                <div className="flex flex-col items-center justify-center py-5 rounded-xl mb-5"
                  style={{
                    backgroundColor: getScoreBgRgba(selectedResult.score),
                    border: `1px solid ${getScoreBorder(selectedResult.score)}`,
                  }}>
                  <div className="text-5xl font-bold" style={{ color: getScoreColor(selectedResult.score) }}>
                    {selectedResult.score}%
                  </div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: getScoreColor(selectedResult.score) }}>
                    {selectedResult.passed ? '✓ اجتزت الامتحان بنجاح' : '✗ لم تجتز الامتحان'}
                  </div>
                </div>

                {/* stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <FaCheckCircle className="text-emerald-400" />, label: 'الإجابات الصحيحة', value: `${selectedResult.correctAnswers} / ${selectedResult.totalQuestions}` },
                    { icon: <FaTimesCircle className="text-red-400" />,     label: 'الإجابات الخاطئة',  value: selectedResult.wrongAnswers },
                    { icon: <FaClock style={{ color: 'var(--color-primary-light)' }} />, label: 'الوقت المستغرق', value: `${selectedResult.timeTaken} دقيقة` },
                    { icon: <FaStar  style={{ color: 'var(--color-primary-light)' }} />, label: 'درجة النجاح',     value: `${selectedResult.passingScore}%` },
                    { icon: <FaClock className="text-gray-500" />,           label: 'مدة الامتحان',      value: `${selectedResult.timeLimit} دقيقة` },
                    { icon: <FaCalendarAlt className="text-gray-500" />,     label: 'التاريخ',            value: new Date(selectedResult.createdAt).toLocaleDateString('ar-EG') },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${DIVIDER}` }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
                        <p className="text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExamHistory;
