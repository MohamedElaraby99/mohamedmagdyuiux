import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaTimes,
  FaClock,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaPause,
  FaRedo,
  FaChartBar,
  FaTrophy,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaHistory
} from 'react-icons/fa';
import { takeTrainingExam, takeFinalExam, clearExamError, clearLastExamResult } from '../../Redux/Slices/ExamSlice';
import { axiosInstance } from '../../Helpers/axiosInstance';
import { generateImageUrl } from '../../utils/fileUtils';
import { toast } from 'react-hot-toast';
import ExamHistoryModal from './ExamHistoryModal';

const ExamModal = ({ isOpen, onClose, exam, courseId, lessonId, unitId, examType = 'training' }) => {
  const dispatch = useDispatch();
  const { loading, error, lastExamResult } = useSelector(state => state.exam);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(() => {
    const limit = exam?.timeLimit;

    return (limit && !isNaN(limit)) ? limit * 60 : 1800; // Default to 30 minutes (1800 seconds)
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const questions = exam?.questions || [];
  const totalQuestions = questions.length;

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // Reset state when exam changes
  useEffect(() => {
    if (exam && !examStarted) {
      const limit = exam.timeLimit;

      const validLimit = (limit && !isNaN(limit)) ? limit * 60 : 1800; // Default to 30 minutes
      setTimeLeft(validLimit);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setExamCompleted(false);
      setShowResults(false);
      setTimeTaken(0);
    }
  }, [exam]);

  // Reset stale results when opening a different exam
  useEffect(() => {
    // Clear previous results when exam changes
    dispatch(clearLastExamResult());
    setShowResults(false);
    setExamCompleted(false);
    setIsTimerRunning(false);
  }, [dispatch, exam?._id]);

  // Handle exam result only when it matches current exam context
  useEffect(() => {
    if (!lastExamResult) return;
    // If backend includes examId, ensure it matches current exam
    if (lastExamResult.examId && exam?._id && String(lastExamResult.examId) !== String(exam._id)) {
      return;
    }
    setShowResults(true);
    setExamCompleted(true);
    setIsTimerRunning(false);
  }, [lastExamResult, exam?._id]);

  const formatTime = (seconds) => {
    // Ensure seconds is a valid number
    if (isNaN(seconds) || seconds < 0) {
      return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {

    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionIndex]: selectedAnswer
      };

      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Show confirmation modal before submitting
  const handleSubmitExam = () => {

    if (loading) return;
    setShowConfirmModal(true);
  };

  // Actually submit the exam after confirmation
  const confirmSubmitExam = () => {

    setShowConfirmModal(false);

    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = questions.length;

    if (answeredQuestions === 0) {
      toast.error('يجب الإجابة على سؤال واحد على الأقل');
      return;
    }

    const timeTakenMinutes = Math.round((Date.now() - startTimeRef.current) / 60000);
    setTimeTaken(timeTakenMinutes);
    setIsTimerRunning(false);

    const examData = {
      courseId,
      lessonId,
      unitId,
      examId: exam._id,
      answers: Object.keys(answers).map(key => ({
        questionIndex: parseInt(key),
        selectedAnswer: answers[key]
      })),
      startTime: new Date(startTimeRef.current).toISOString(), // Send start time to backend
      timeTaken: timeTakenMinutes // Keep for backwards compatibility
    };

    if (examType === 'training') {
      dispatch(takeTrainingExam(examData));
    } else {
      dispatch(takeFinalExam(examData));
    }
  };

  const handleClose = () => {
    if (examStarted && !examCompleted) {
      if (window.confirm('هل أنت متأكد من إغلاق الامتحان؟ سيتم فقدان تقدمك.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) return 'answered';
    return 'unanswered';
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    return (
      <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-400">
              السؤال {currentQuestionIndex + 1} من {totalQuestions}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: timeLeft < 300 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)' }}>
              <FaClock className={timeLeft < 300 ? 'text-red-400' : 'text-gray-400'} />
              <span className={`text-sm font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-gray-200'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {question.image && (
            <div className="mb-4 flex justify-center">
              <div
                className="rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                style={{ maxWidth: '280px', border: '1px solid rgba(255,255,255,0.15)' }}
                onClick={() => { setCurrentImage(generateImageUrl(question.image)); setImageModalOpen(true); }}
              >
                <img
                  src={generateImageUrl(question.image)}
                  alt="صورة السؤال"
                  className="w-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          )}

          <h3 className="text-base font-semibold text-white mb-4 leading-relaxed" dir="rtl">
            {question.question}
          </h3>
        </div>

        <div className="space-y-2" dir="rtl">
          {question.options.slice(0, question.numberOfOptions || 4).map((option, optionIndex) => {
            const selected = answers[currentQuestionIndex] === optionIndex;
            return (
              <label
                key={optionIndex}
                className="flex items-center p-3.5 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background: selected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                  border: selected ? '1.5px solid rgba(99,102,241,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
                }}
              >
                <input type="radio" name={`question-${currentQuestionIndex}`} value={optionIndex}
                  checked={selected} onChange={() => handleAnswerSelect(currentQuestionIndex, optionIndex)} className="sr-only" />
                <div className="w-5 h-5 rounded-full border-2 ml-3 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: selected ? '#6366f1' : 'rgba(255,255,255,0.3)', background: selected ? '#6366f1' : 'transparent' }}>
                  {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-gray-200 text-sm">{option}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderQuestionNavigation = () => (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center justify-between mb-3" dir="rtl">
        <h4 className="font-semibold text-white text-sm">الأسئلة</h4>
        <div className="text-xs text-gray-400">
          {Object.keys(answers).length}/{totalQuestions} تمت
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((_, index) => {
          const isCurrent = index === currentQuestionIndex;
          const isAnswered = getQuestionStatus(index) === 'answered';
          return (
            <button key={index} onClick={() => setCurrentQuestionIndex(index)}
              className="w-9 h-9 rounded-lg text-xs font-bold transition-all"
              style={{
                background: isCurrent ? '#6366f1' : isAnswered ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                color: isCurrent ? 'white' : isAnswered ? '#34d399' : '#9ca3af',
                border: isCurrent ? '2px solid #6366f1' : isAnswered ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
              }}>
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!lastExamResult) return null;

    const { score, totalQuestions, correctAnswers, wrongAnswers } = lastExamResult;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 50;

    return (
      <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} dir="rtl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `2px solid ${passed ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
            {passed
              ? <FaTrophy className="text-3xl text-emerald-400" />
              : <FaExclamationTriangle className="text-3xl text-red-400" />}
          </div>
          <h3 className={`text-2xl font-bold mb-1 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {passed
              ? (percentage === 100 ? 'ممتاز! درجة كاملة!' : percentage >= 80 ? 'مبروك! أداء جيد جداً' : 'مبروك! لقد نجحت')
              : 'حاول مرة أخرى'}
          </h3>
          <p className="text-gray-400 text-sm">
            {passed ? 'استمر في التعلم والتقدم' : 'لا تستسلم، راجع المحتوى وحاول مجدداً'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div className="text-3xl font-bold text-indigo-300">{percentage}%</div>
            <div className="text-gray-400 text-xs mt-1">النسبة المئوية</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div className="text-3xl font-bold text-indigo-300">{score}</div>
            <div className="text-gray-400 text-xs mt-1">الدرجة</div>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {[
            { label: 'الإجابات الصحيحة', val: correctAnswers, color: '#34d399' },
            { label: 'الإجابات الخاطئة', val: wrongAnswers, color: '#f87171' },
            { label: 'الوقت المستغرق', val: `${timeTaken} دقيقة`, color: '#a78bfa' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color }} className="font-semibold text-sm">{val}</span>
              <span className="text-gray-300 text-sm">{label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button onClick={() => setHistoryModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white transition-all flex items-center justify-center gap-2"
            style={{ background: 'rgba(99,102,241,0.5)', border: '1px solid rgba(99,102,241,0.4)' }}>
            <FaHistory /> مراجعة الأسئلة والإجابات
          </button>
          <button onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            إغلاق
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen || !exam) return null;

  const NAV_BG = { background: '#0a1120', borderBottom: '1px solid rgba(255,255,255,0.08)' };
  const MODAL_BG = { background: '#0d1829' };
  const CARD_STYLE = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col" style={MODAL_BG}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={NAV_BG} dir="rtl">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{exam.title}</h2>
            {exam.description && <p className="text-gray-400 text-xs mt-0.5 truncate">{exam.description}</p>}
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors flex-shrink-0 mr-4 p-1">
            <FaTimes className="text-lg" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }} dir="rtl">
              {error}
            </div>
          )}

          {!examStarted ? (
            // ── Start Screen ──────────────────────────────────────────────────
            <div className="flex items-center justify-center py-6">
              <div className="rounded-2xl p-8 w-full max-w-sm text-center" style={CARD_STYLE}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <FaCheck className="text-indigo-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{exam.title}</h3>
                {exam.description && <p className="text-gray-400 text-sm mb-5">{exam.description}</p>}

                <div className="space-y-2 mb-6 text-right" dir="rtl">
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="font-bold text-white">{totalQuestions}</span>
                    <span className="text-gray-400 text-sm">عدد الأسئلة</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <FaClock className="text-indigo-400 text-xs" />
                      {exam.timeLimit && !isNaN(exam.timeLimit) ? exam.timeLimit : 30} دقيقة
                    </span>
                    <span className="text-gray-400 text-sm">الوقت المحدد</span>
                  </div>
                </div>

                <button onClick={handleStartExam} disabled={loading}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'rgba(99,102,241,0.85)' }}>
                  <FaPlay className="text-sm" />
                  {loading ? 'جاري التحميل...' : 'ابدأ الامتحان'}
                </button>
              </div>
            </div>

          ) : showResults ? (
            renderResults()
          ) : (
            // ── Exam Interface ────────────────────────────────────────────────
            <div className="space-y-4">
              <div className="block lg:hidden">{renderQuestionNavigation()}</div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                  {renderQuestion()}
                  <div className="flex items-center justify-between mt-4" dir="rtl">
                    <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all disabled:opacity-40"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <FaChevronRight className="text-xs" /> السابق
                    </button>
                    <button onClick={handleSubmitExam} disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                      style={{ background: 'rgba(99,102,241,0.8)' }}>
                      {loading ? 'جاري الإرسال...' : 'إنهاء الامتحان'} <FaCheck className="text-xs" />
                    </button>
                    <button onClick={handleNextQuestion} disabled={currentQuestionIndex === totalQuestions - 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all disabled:opacity-40"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      التالي <FaChevronLeft className="text-xs" />
                    </button>
                  </div>
                </div>
                <div className="hidden lg:block lg:col-span-1">{renderQuestionNavigation()}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && currentImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="relative max-w-3xl max-h-[90vh] p-4">
            <button onClick={() => { setImageModalOpen(false); setCurrentImage(null); }}
              className="absolute top-2 left-2 z-10 rounded-full p-2 transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <FaTimes className="text-white text-base" />
            </button>
            <img src={currentImage} alt="صورة السؤال" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

      <ExamHistoryModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)}
        exam={exam} courseId={courseId} lessonId={lessonId} examType={examType} examResult={lastExamResult} />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4" style={{ background: '#0d1829', border: '1px solid rgba(255,255,255,0.12)' }} dir="rtl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <FaExclamationTriangle className="text-yellow-400 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">هل أنت متأكد من إنهاء الامتحان؟</h3>
              <p className="text-sm">
                {Object.keys(answers).length < questions.length
                  ? <span className="text-yellow-400">لديك {questions.length - Object.keys(answers).length} سؤال لم تجب عليه</span>
                  : <span className="text-emerald-400">تم الإجابة على جميع الأسئلة ✓</span>}
              </p>
              <p className="text-gray-500 text-xs mt-1">لن تتمكن من التعديل بعد الإرسال</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-gray-300 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                إلغاء
              </button>
              <button onClick={confirmSubmitExam}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'rgba(99,102,241,0.85)' }}>
                تأكيد الإرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamModal;
