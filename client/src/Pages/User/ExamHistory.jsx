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
  FaArrowLeft,
  FaArrowRight,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700';
    return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700';
  };

  const getExamTypeBadge = (examType) => {
    return examType === 'training' ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
        <FaClipboardCheck className="text-[10px]" />
        تدريبي
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
        <FaGraduationCap className="text-[10px]" />
        نهائي
      </span>
    );
  };

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setShowResultModal(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const avgScore = examHistory.length > 0
    ? Math.round(examHistory.reduce((sum, r) => sum + r.score, 0) / examHistory.length)
    : 0;

  const stats = [
    {
      label: 'امتحانات التدريب',
      value: examHistory.filter(r => r.examType === 'training').length,
      icon: <FaClipboardCheck className="text-xl" />,
      colorClass: 'text-primary',
      bgClass: 'bg-primary-light/10',
    },
    {
      label: 'الامتحانات النهائية',
      value: examHistory.filter(r => r.examType === 'final').length,
      icon: <FaGraduationCap className="text-xl" />,
      colorClass: 'text-orange-500',
      bgClass: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      label: 'اجتزت بنجاح',
      value: examHistory.filter(r => r.passed).length,
      icon: <FaTrophy className="text-xl" />,
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-100 dark:bg-emerald-900/20',
    },
    {
      label: 'متوسط الدرجات',
      value: `${avgScore}%`,
      icon: <FaStar className="text-xl" />,
      colorClass: 'text-primary',
      bgClass: 'bg-primary-light/10',
    },
  ];

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen hero-bg-gradient flex items-center justify-center" dir="rtl">
          <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-sm mx-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              <FaUser className="text-2xl text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">يرجى تسجيل الدخول</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">يجب عليك تسجيل الدخول لعرض سجل الامتحانات.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen hero-bg-gradient" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-white shadow-md" style={{ backgroundColor: 'var(--color-primary)' }}>
                <FaHistory className="text-base" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary">
                سجل الامتحانات
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mr-[52px]">
              استعرض جميع نتائج امتحاناتك وتتبع أدائك
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.bgClass} ${stat.colorClass}`}>
                    {stat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight truncate">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Results Table Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-primary" style={{ backgroundColor: 'var(--color-primary)' }}></div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">نتائج الامتحانات الأخيرة</h2>
            </div>

            {/* States */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 border-[3px] rounded-full animate-spin mx-auto mb-4 border-primary border-t-transparent" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
                <p className="text-gray-500 dark:text-gray-400">جاري تحميل سجل الامتحانات...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTimesCircle className="text-2xl text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">خطأ في تحميل النتائج</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
              </div>
            ) : examHistory.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  <FaHistory className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">لا توجد نتائج بعد</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">لم تقم بأداء أي امتحانات. ابدأ التعلم والمشاركة في الامتحانات!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {examHistory.map((result) => (
                  <div key={result._id} className="p-4 sm:p-6 hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

                      {/* Exam Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                          {result.examType === 'training'
                            ? <FaClipboardCheck className="text-primary text-sm" />
                            : <FaGraduationCap className="text-orange-500 text-sm" />
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {result.lessonTitle}
                            </h3>
                            {getExamTypeBadge(result.examType)}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            {result.unitTitle && (
                              <span className="flex items-center gap-1">
                                <FaBookOpen className="text-[10px]" />
                                {result.unitTitle}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-[10px]" />
                              <span className="hidden sm:inline">{formatDate(result.createdAt)}</span>
                              <span className="sm:hidden">{new Date(result.createdAt).toLocaleDateString('ar-EG')}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-[10px]" />
                              {result.timeTaken} دقيقة
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score & Action */}
                      <div className="flex items-center gap-3 mr-12 sm:mr-0">
                        {/* Mini stats */}
                        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaCheckCircle className="text-emerald-500" />
                            {result.correctAnswers}/{result.totalQuestions}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaTimesCircle className="text-red-400" />
                            {result.wrongAnswers}
                          </span>
                        </div>

                        {/* Score badge */}
                        <div className={`text-center px-3 py-2 rounded-xl min-w-[64px] ${getScoreBg(result.score)}`}>
                          <div className={`text-lg font-bold leading-none ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </div>
                          <div className={`text-[10px] mt-0.5 font-medium ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                            {result.passed ? 'ناجح' : 'راسب'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleViewResult(result)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-medium transition-all hover:opacity-90 active:scale-95 btn-primary"
                        >
                          <FaEye className="text-xs" />
                          <span className="hidden sm:inline">التفاصيل</span>
                          <span className="sm:hidden">عرض</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom quick stats (mobile friendly) */}
                    <div className="sm:hidden mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mr-12">
                      <span className="flex items-center gap-1">
                        <FaCheckCircle className="text-emerald-500" />
                        صحيح: {result.correctAnswers}/{result.totalQuestions}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaTimesCircle className="text-red-400" />
                        خطأ: {result.wrongAnswers}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {examHistoryPagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  عرض{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {((examHistoryPagination.currentPage - 1) * examHistoryPagination.resultsPerPage) + 1}
                  </span>
                  {' '}–{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {Math.min(examHistoryPagination.currentPage * examHistoryPagination.resultsPerPage, examHistoryPagination.totalResults)}
                  </span>
                  {' '}من{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {examHistoryPagination.totalResults}
                  </span>
                  {' '}نتيجة
                </p>

                <div className="flex items-center gap-1.5">
                  {/* Next (RTL: right = next) */}
                  <button
                    onClick={() => handlePageChange(examHistoryPagination.currentPage + 1)}
                    disabled={examHistoryPagination.currentPage === examHistoryPagination.totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>

                  {Array.from({ length: examHistoryPagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${page === examHistoryPagination.currentPage
                        ? 'btn-primary text-white shadow-md'
                        : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Prev (RTL: left = prev) */}
                  <button
                    onClick={() => handlePageChange(examHistoryPagination.currentPage - 1)}
                    disabled={examHistoryPagination.currentPage === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result Detail Modal */}
        {showResultModal && selectedResult && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[90] p-4"
            onClick={(e) => e.target === e.currentTarget && setShowResultModal(false)}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">

              {/* Modal Header */}
              <div className="px-6 py-5 bg-primary text-white relative" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="absolute left-4 top-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-xs text-white" />
                </button>
                <div className="flex items-center gap-3 pr-1">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    {selectedResult.examType === 'training'
                      ? <FaClipboardCheck className="text-white" />
                      : <FaGraduationCap className="text-white" />
                    }
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{selectedResult.lessonTitle}</h3>
                    <p className="text-white/70 text-xs mt-0.5">
                      {selectedResult.examType === 'training' ? 'امتحان تدريبي' : 'امتحان نهائي'}
                      {selectedResult.unitTitle && ` · ${selectedResult.unitTitle}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Score highlight */}
                <div className={`flex flex-col items-center justify-center py-5 rounded-xl mb-5 ${getScoreBg(selectedResult.score)}`}>
                  <div className={`text-5xl font-bold ${getScoreColor(selectedResult.score)}`}>
                    {selectedResult.score}%
                  </div>
                  <div className={`mt-1 text-sm font-semibold ${selectedResult.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {selectedResult.passed ? '✓ اجتزت الامتحان بنجاح' : '✗ لم تجتز الامتحان'}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <FaCheckCircle className="text-emerald-500" />, label: 'الإجابات الصحيحة', value: `${selectedResult.correctAnswers} / ${selectedResult.totalQuestions}` },
                    { icon: <FaTimesCircle className="text-red-400" />, label: 'الإجابات الخاطئة', value: selectedResult.wrongAnswers },
                    { icon: <FaClock className="text-primary" />, label: 'الوقت المستغرق', value: `${selectedResult.timeTaken} دقيقة` },
                    { icon: <FaStar className="text-primary" />, label: 'درجة النجاح', value: `${selectedResult.passingScore}%` },
                    { icon: <FaClock className="text-gray-400" />, label: 'مدة الامتحان', value: `${selectedResult.timeLimit} دقيقة` },
                    { icon: <FaCalendarAlt className="text-gray-400" />, label: 'التاريخ', value: new Date(selectedResult.createdAt).toLocaleDateString('ar-EG') },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/60">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-gray-600 shadow-sm flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.value}</p>
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
