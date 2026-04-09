import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCourseById } from '../../Redux/Slices/CourseSlice';
import { logout } from '../../Redux/Slices/AuthSlice';
import {
  purchaseCourse,
  checkCoursePurchaseStatus,
  getWalletBalance
} from '../../Redux/Slices/PaymentSlice';
import { updateVideoProgress } from '../../Redux/Slices/VideoProgressSlice';

import { PaymentSuccessAlert, PaymentErrorAlert, WalletAlert } from '../../Components/ModernAlert';
import OptimizedLessonContentModal from '../../Components/OptimizedLessonContentModal';
import ExamModal from '../../Components/Exam/ExamModal';
import EssayExamModal from '../../Components/EssayExamModal';
import CustomVideoPlayer from '../../Components/CustomVideoPlayer';
import PDFViewer from '../../Components/PDFViewer';
import ImageViewer from '../../Components/ImageViewer';
import {
  FaUser, FaPlay, FaArrowRight, FaArrowLeft,
  FaChevronDown,
  FaLock, FaLockOpen, FaTimes, FaDownload,
  FaFilePdf, FaClipboardList, FaDumbbell, FaImage,
  FaShoppingCart, FaBookOpen, FaVideo, FaCheckCircle, FaPaperPlane, FaComments, FaExclamationTriangle
} from 'react-icons/fa';
import { generateFileUrl, generateImageUrl } from '../../utils/fileUtils';
import { checkCourseAccess, redeemCourseAccessCode } from '../../Redux/Slices/CourseAccessSlice';
import { axiosInstance } from '../../Helpers/axiosInstance';
import RemainingDaysLabel from '../../Components/RemainingDaysLabel';
import useLessonData from '../../Helpers/useLessonData';
import { BRAND } from '../../Constants/LayoutConfig';

// ── helpers ──────────────────────────────────────────────────────────────────
const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const ytThumb = (id) => id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '';

// ── component ─────────────────────────────────────────────────────────────────
export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, loading } = useSelector((s) => s.course);
  const { walletBalance, coursePurchaseStatus, loading: paymentLoading } = useSelector((s) => s.payment);
  const { data: user, isLoggedIn } = useSelector((s) => s.auth);
  const courseAccessState = useSelector((s) => s.courseAccess.byCourseId[id]);

  // ── core state ────────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [accessAlertShown, setAccessAlertShown] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [mainMenuOpen, setMainMenuOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showWalletAlert, setShowWalletAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [showCoursePurchaseModal, setShowCoursePurchaseModal] = useState(false);
  const [showRedeemPanel, setShowRedeemPanel] = useState(false);

  // ── inline player state ───────────────────────────────────────────────────
  const [activeLesson, setActiveLesson] = useState(null); // { lessonId, unitId, title, unitTitle, unitIndex }
  const [activeTab, setActiveTab] = useState('كويز فتح المحتوى');
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  // entry exam / task
  const [entryExamModalOpen, setEntryExamModalOpen] = useState(false);
  const [entryExamAnswers, setEntryExamAnswers] = useState({});
  const [taskLink, setTaskLink] = useState('');
  const [taskImage, setTaskImage] = useState('');
  const [taskUploading, setTaskUploading] = useState(false);
  const [entryExamSubmitting, setEntryExamSubmitting] = useState(false);
  const [entryExamResult, setEntryExamResult] = useState(null);
  const [entryExamStartTime, setEntryExamStartTime] = useState(null);
  const [entryExamStarted, setEntryExamStarted] = useState(false);
  // exam modals
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentExamType, setCurrentExamType] = useState('exam');
  const [essayExamModalOpen, setEssayExamModalOpen] = useState(false);
  const [selectedEssayExam, setSelectedEssayExam] = useState(null);
  // PDF viewer
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);
  // Image viewer
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  // YouTube durations cache: { [videoId]: seconds }
  const [ytDurations, setYtDurations] = useState({});

  // ── access helpers (before hooks that depend on them) ─────────────────────
  const isCoursePurchased = () => {
    if (!currentCourse) return false;
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') return true;
    if (courseAccessState?.hasAccess) return true;
    return coursePurchaseStatus[currentCourse._id] || false;
  };

  const hasContentAccess = () => {
    if (!user || !isLoggedIn) return false;
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') return true;
    const price = currentCourse?.price || 0;
    if (price <= 0) return true;
    if (isCoursePurchased()) return true;
    if (courseAccessState?.source === 'code' && courseAccessState?.accessEndAt) {
      if (new Date(courseAccessState.accessEndAt) <= new Date()) return false;
    }
    return courseAccessState?.hasAccess || false;
  };

  const isActiveLessonFree = () => {
    if (!activeLesson || !currentCourse) return false;
    const dl = currentCourse.directLessons?.find(l => l._id === activeLesson.lessonId);
    if (dl?.isFree) return true;
    if (activeLesson.unitId) {
      const unit = currentCourse.units?.find(u => u._id === activeLesson.unitId);
      if (unit?.isFree) return true;
      const lesson = unit?.lessons?.find(l => l._id === activeLesson.lessonId);
      if (lesson?.isFree) return true;
    } else {
      for (const u of (currentCourse.units || [])) {
        const lesson = u.lessons?.find(l => l._id === activeLesson.lessonId);
        if (lesson) return lesson.isFree || u.isFree;
      }
    }
    return false;
  };

  // ── lesson data for inline view ───────────────────────────────────────────
  const canFetchLesson = activeLesson && (hasContentAccess() || isActiveLessonFree());
  const {
    lesson: activeLessonData,
    loading: lessonLoading,
    error: lessonError,
    refetch: refetchLesson,
  } = useLessonData(
    canFetchLesson ? id : null,
    activeLesson?.lessonId,
    activeLesson?.unitId
  );
  const isLessonLocked = activeLesson && !canFetchLesson;

  // ── effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) setSidebarOpen(true);
      if (mobile && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => { if (id) dispatch(getCourseById(id)); }, [dispatch, id]);

  // Auto-fetch YouTube durations for videos that don't have duration set
  useEffect(() => {
    if (!activeLessonData?.videos?.length) return;
    const videosNeedingDuration = activeLessonData.videos.filter(v => {
      const ytId = extractYouTubeId(v.url);
      return ytId && !v.duration && !ytDurations[ytId];
    });
    if (!videosNeedingDuration.length) return;

    videosNeedingDuration.forEach(async (v) => {
      const ytId = extractYouTubeId(v.url);
      if (!ytId) return;
      try {
        const res = await axiosInstance.get(`/youtube-duration?videoId=${ytId}`);
        if (res.data.success && res.data.duration > 0) {
          setYtDurations(prev => ({ ...prev, [ytId]: res.data.duration }));
        }
      } catch (_) {}
    });
  }, [activeLessonData?.videos]);

  useEffect(() => {
    if (id && user && isLoggedIn) dispatch(checkCourseAccess(id));
  }, [dispatch, id, user, isLoggedIn]);

  useEffect(() => {
    if (!courseAccessState?.hasAccess || !courseAccessState?.accessEndAt) return;
    const interval = setInterval(() => {
      const expired = new Date(courseAccessState.accessEndAt) <= new Date();
      if (expired) {
        dispatch(checkCourseAccess(id));
        if (!accessAlertShown) {
          setAlertMessage('انتهت صلاحية الوصول. يرجى شراء الكورس للاستمرار.');
          setShowErrorAlert(true);
          setAccessAlertShown(true);
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [courseAccessState?.hasAccess, courseAccessState?.accessEndAt, dispatch, id, accessAlertShown]);

  useEffect(() => {
    if (user && isLoggedIn && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      dispatch(getWalletBalance());
    }
  }, [dispatch, user, isLoggedIn]);

  useEffect(() => {
    if (currentCourse && user && isLoggedIn && currentCourse.price > 0) {
      dispatch(checkCoursePurchaseStatus({ courseId: currentCourse._id }));
    }
  }, [currentCourse, user, isLoggedIn, dispatch]);

  // Auto-select first lesson when course loads
  useEffect(() => {
    if (!currentCourse || activeLesson) return;
    const first = currentCourse.directLessons?.[0];
    if (first) {
      setActiveLesson({ lessonId: first._id, unitId: null, title: first.title, unitTitle: null, unitIndex: null });
    } else if (currentCourse.units?.[0]?.lessons?.[0]) {
      const unit = currentCourse.units[0];
      setActiveLesson({ lessonId: unit.lessons[0]._id, unitId: unit._id, title: unit.lessons[0].title, unitTitle: unit.title, unitIndex: 0 });
    }
  }, [currentCourse]);

  // Reset entry exam state when lesson changes
  useEffect(() => {
    setEntryExamAnswers({});
    setTaskLink('');
    setTaskImage('');
    setEntryExamResult(null);
    setEntryExamStarted(false);
    setEntryExamStartTime(null);
    setActiveTab('كويز فتح المحتوى');
  }, [activeLesson?.lessonId]);

  const toggleMainSidebar = () => setMainMenuOpen(prev => !prev);

  const getTotalLessons = (course) => {
    if (!course) return 0;
    return (course.directLessons?.length || 0) +
      (course.units?.reduce((s, u) => s + (u.lessons?.length || 0), 0) || 0);
  };

  const getAllLessons = () => {
    if (!currentCourse) return [];
    const list = [];
    (currentCourse.directLessons || []).forEach((l) =>
      list.push({ ...l, unitId: null, unitTitle: null, unitIndex: null })
    );
    (currentCourse.units || []).forEach((unit, ui) =>
      (unit.lessons || []).forEach((l) =>
        list.push({ ...l, unitId: unit._id, unitTitle: unit.title, unitIndex: ui })
      )
    );
    return list;
  };

  const allLessons = currentCourse ? getAllLessons() : [];
  const currentIdx = allLessons.findIndex((l) => l._id === activeLesson?.lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const navigateToLesson = (lesson) => {
    setActiveLesson({
      lessonId: lesson._id,
      unitId: lesson.unitId,
      title: lesson.title,
      unitTitle: lesson.unitTitle,
      unitIndex: lesson.unitIndex,
    });
  };

  const handleCompleteLesson = async () => {
    // Mark first video as completed if exists
    if (activeLessonData?.videos?.[0] && id) {
      const videoId = activeLessonData.videos[0]._id;
      dispatch(updateVideoProgress({
        courseId: id,
        videoId,
        progressData: { progress: 100, isCompleted: true, currentTime: activeLessonData.videos[0].duration || 0 },
      }));
    }
    // Go to next lesson or show done message
    if (nextLesson) {
      navigateToLesson(nextLesson);
    } else {
      setAlertMessage('أحسنت! لقد أكملت آخر درس في الكورس 🎉');
      setShowSuccessAlert(true);
    }
  };

  // ── access handlers ───────────────────────────────────────────────────────
  const handleLessonClick = (lesson, unitId = null, unitTitle = null, unitIndex = null) => {
    if (!user || !isLoggedIn) {
      setAlertMessage('يرجى تسجيل الدخول أولاً لمشاهدة المحتوى');
      setShowErrorAlert(true);
      setTimeout(() => navigate('/login', { state: { from: `/courses/${id}` } }), 2000);
      return;
    }
    const parentUnit = unitId ? currentCourse?.units?.find((u) => u._id === unitId) : null;
    const isFreeLesson = lesson.isFree || parentUnit?.isFree;
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    if (isAdmin || isFreeLesson || hasContentAccess()) {
      setActiveLesson({ lessonId: lesson._id, unitId, title: lesson.title, unitTitle, unitIndex });
      return;
    }
    if (courseAccessState?.source === 'code' && courseAccessState?.accessEndAt) {
      if (new Date(courseAccessState.accessEndAt) <= new Date()) {
        setAlertMessage('انتهت صلاحية الوصول. يرجى شراء الكورس للاستمرار.');
        setShowErrorAlert(true);
        return;
      }
    }
    setAlertMessage('يجب شراء الكورس للوصول إلى هذا المحتوى.');
    setShowErrorAlert(true);
  };

  const handleCoursePurchase = async () => {
    if (!currentCourse) return;
    try {
      await dispatch(purchaseCourse({ courseId: currentCourse._id })).unwrap();
      setShowCoursePurchaseModal(false);
      setAlertMessage('تم شراء الكورس بنجاح! يمكنك الآن الوصول لجميع المحتوى');
      setShowSuccessAlert(true);
      dispatch(getWalletBalance());
      dispatch(checkCoursePurchaseStatus({ courseId: currentCourse._id }));
    } catch (error) {
      setAlertMessage(error.message || 'حدث خطأ أثناء شراء الكورس');
      setShowErrorAlert(true);
    }
  };

  const handleCoursePurchaseClick = async () => {
    if (!user || !isLoggedIn) {
      setAlertMessage('يرجى تسجيل الدخول أولاً لشراء الكورس');
      setShowErrorAlert(true);
      setTimeout(() => navigate('/login', { state: { from: `/courses/${id}` } }), 2000);
      return;
    }
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      setAlertMessage('أنت مدير النظام - لديك صلاحية الوصول لجميع المحتوى');
      setShowSuccessAlert(true);
      return;
    }
    if (isCoursePurchased()) {
      setAlertMessage('لقد قمت بشراء هذا الكورس مسبقاً');
      setShowSuccessAlert(true);
      return;
    }
    if (walletBalance < currentCourse.price) {
      setAlertMessage(`رصيدك الحالي ${walletBalance} جنيه وسعر الكورس ${currentCourse.price} جنيه. اشحن المحفظة الأول.`);
      setShowErrorAlert(true);
      setTimeout(() => navigate('/wallet'), 2500);
      return;
    }
    await handleCoursePurchase();
  };

  const handleRedeemCode = async (e) => {
    e.preventDefault();
    if (!redeemCode.trim()) { setAlertMessage('يرجى إدخال الكود أولاً'); setShowErrorAlert(true); return; }
    const codeFormat = /^[A-Z0-9]{8,12}$/;
    if (!codeFormat.test(redeemCode.trim().toUpperCase())) {
      setAlertMessage('تنسيق الكود غير صحيح. يجب أن يتكون الكود من 8-12 حرف وأرقام باللغة الإنجليزية فقط');
      setShowErrorAlert(true);
      return;
    }
    try {
      await dispatch(redeemCourseAccessCode({ code: redeemCode.trim().toUpperCase(), courseId: currentCourse._id })).unwrap();
      setRedeemCode('');
      setAlertMessage('تم تفعيل الوصول للكورس بنجاح!');
      setShowSuccessAlert(true);
      setAccessAlertShown(false);
      dispatch(checkCourseAccess(currentCourse._id));
    } catch (err) {
      setAlertMessage(err?.message || 'تعذر تفعيل الكود');
      setShowErrorAlert(true);
    }
  };

  // ── entry exam / task handlers ────────────────────────────────────────────
  const handleTaskImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTaskUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axiosInstance.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) setTaskImage(res.data.url);
      else alert(res.data.message || 'فشل في رفع الصورة');
    } catch { alert('فشل في رفع الصورة'); }
    finally { setTaskUploading(false); }
  };

  const handleSubmitEntryExam = async () => {
    if (!activeLessonData?.entryExam) return;
    const isTask = activeLessonData.entryExam.type === 'task';
    if (isTask) {
      if (!taskLink && !taskImage) { alert('يرجى إضافة رابط أو صورة للمهمة'); return; }
      setEntryExamSubmitting(true);
      try {
        const res = await axiosInstance.post('/exams/entry', { courseId: id, lessonId: activeLesson.lessonId, unitId: activeLesson.unitId, taskLink, taskImage });
        if (res.data.success) { setEntryExamResult(res.data.data); refetchLesson(); }
        else alert(res.data.message || 'حدث خطأ أثناء إرسال المهمة');
      } catch (err) { alert(err.response?.data?.message || 'حدث خطأ أثناء إرسال المهمة'); }
      finally { setEntryExamSubmitting(false); }
    } else {
      const answersArray = Object.keys(entryExamAnswers).map((k) => ({ questionIndex: parseInt(k), selectedAnswer: entryExamAnswers[k] }));
      if (answersArray.length < activeLessonData.entryExam.questions?.length) { alert('يرجى الإجابة على جميع الأسئلة'); return; }
      setEntryExamSubmitting(true);
      try {
        const res = await axiosInstance.post('/exams/entry', { courseId: id, lessonId: activeLesson.lessonId, unitId: activeLesson.unitId, answers: answersArray, startTime: entryExamStartTime?.toISOString() || new Date().toISOString() });
        if (res.data.success) { setEntryExamResult(res.data.data); refetchLesson(); }
        else alert(res.data.message || 'حدث خطأ أثناء إرسال الامتحان');
      } catch (err) { alert(err.response?.data?.message || 'حدث خطأ أثناء إرسال الامتحان'); }
      finally { setEntryExamSubmitting(false); }
    }
  };

    // ── render tab content ────────────────────────────────────────────────────

  // تاب "واجب" ← التدريبات
  const renderWajibTab = () => {
    if (!activeLessonData) return <div className="text-gray-400 text-center py-8">جاري التحميل...</div>;

    const isLocked = activeLessonData.hasEntryExam && !activeLessonData.contentUnlocked;
    const trainings = activeLessonData.trainings || [];
    const lockedCount = activeLessonData.lockedTrainingsCount || 0;
    const totalCount = trainings.length + lockedCount;

    // محتوى مقفول
    if (isLocked && totalCount > 0) return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <FaLock className="text-yellow-400 text-xl" />
        </div>
        <h3 className="text-white font-bold mb-1">التدريبات مقفولة</h3>
        <p className="text-gray-400 text-sm mb-1">يوجد <span className="text-yellow-300 font-bold">{totalCount}</span> تدريب بعد فتح المحتوى</p>
        <p className="text-gray-500 text-xs mb-4">أكمل كويز فتح المحتوى أولاً</p>
        <button onClick={() => setActiveTab('كويز فتح المحتوى')}
          className="flex items-center gap-2 mx-auto px-5 py-2 rounded-lg text-sm text-white"
          style={{ background: 'rgba(99,102,241,0.8)' }}>
          <FaLockOpen className="text-xs" /> اذهب لكويز فتح المحتوى
        </button>
      </div>
    );

    if (!totalCount) return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <FaDumbbell className="text-gray-500 text-xl" />
        </div>
        <p className="text-gray-400">لا توجد تدريبات لهذا الدرس</p>
      </div>
    );

    return (
      <div className="space-y-3">
        {trainings.map((tr) => (
          <div key={tr._id} className="flex items-center justify-between rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => { setSelectedExam(tr); setCurrentExamType('training'); setExamModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm text-white"
              style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.4)' }}>
              <FaPlay className="text-xs" /> ابدأ
            </button>
            <div className="text-right flex-1 px-3">
              <div className="text-white text-sm font-medium">{tr.title}</div>
              <div className="text-gray-500 text-xs">تدريب</div>
            </div>
            <FaDumbbell className="text-green-400" />
          </div>
        ))}
      </div>
    );
  };

  // تاب "كويز فتح المحتوى" ←كويز فتح المحتوى
  const renderKweizFatahTab = () => {
    if (!activeLessonData) return <div className="text-gray-400 text-center py-8">جاري التحميل...</div>;
    if (!activeLessonData.hasEntryExam) {
      return (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <FaCheckCircle className="text-green-400 text-2xl" />
          </div>
          <p className="text-gray-300 text-base">لا يوجد امتحان مدخل لهذا الدرس</p>
        </div>
      );
    }
    const entryExam = activeLessonData.entryExam;
    const isTask = entryExam?.type === 'task';
    const userResult = entryExam?.userResult;

    // Submitted task statuses
    if (isTask && userResult?.hasTaken) {
      if (userResult.status === 'success') return (
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.2)' }}>
            <FaCheckCircle className="text-green-400 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-green-300 mb-2">تم قبول المهمة بنجاح</h3>
          {userResult.adminFeedback && <p className="text-gray-300 text-sm mt-2">{userResult.adminFeedback}</p>}
        </div>
      );
      if (userResult.status === 'pending') return (
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: 'rgba(245,158,11,0.2)' }}>
            <FaClipboardList className="text-yellow-400 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-yellow-300">المهمة قيد المراجعة</h3>
          <p className="text-gray-300 text-sm mt-2">سيتم فتح محتوى الدرس بمجرد اعتمادها</p>
        </div>
      );
      if (userResult.status === 'failed') return (
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.2)' }}>
            <FaExclamationTriangle className="text-red-400 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-red-300">لم يتم اجتياز المهمة</h3>
          {userResult.adminFeedback && <p className="text-gray-300 text-sm mt-2">{userResult.adminFeedback}</p>}
        </div>
      );
    }

    // MCQ success
    if (!isTask && activeLessonData.contentUnlocked && userResult?.hasTaken) return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.2)' }}>
          <FaCheckCircle className="text-green-400 text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-green-300">تم اجتياز كويز فتح المحتوى</h3>
        <p className="text-gray-300 mt-2">النتيجة: {userResult.score} / {userResult.totalQuestions}</p>
      </div>
    );

    if (entryExamResult) {
      if (entryExamResult.status === 'pending') return (
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: 'rgba(245,158,11,0.2)' }}>
            <FaClipboardList className="text-yellow-400 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-yellow-300">تم إرسال المهمة بنجاح</h3>
        </div>
      );
      return (
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.2)' }}>
            <FaCheckCircle className="text-green-400 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-green-300">تم إتمامكويز فتح المحتوى</h3>
          <p className="text-gray-300 mt-2">{entryExamResult.score} / {entryExamResult.totalQuestions} ({entryExamResult.percentage}%)</p>
        </div>
      );
    }

    if (isTask) return (
      <div className="space-y-4">
        <div className="rounded-xl p-5" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <div className="flex items-center gap-2 mb-1">
            <FaClipboardList className="text-indigo-400" />
            <h3 className="text-lg font-bold text-white">تسليم مهمة المحاضرة</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">{entryExam.taskDescription || 'مهمة المحاضرة دي'}</p>
          <div className="flex gap-3 flex-wrap">
            <a href="https://uitrack.io" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.5)' }}>
              <FaBookOpen className="text-indigo-400" /> UI Track
            </a>
            <a href="https://figma.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg viewBox="0 0 38 57" className="w-4 h-4" fill="none">
                <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19H19v9.5z" fill="#1ABCFE" />
                <path d="M9.5 47.5A9.5 9.5 0 0 1 19 38v9.5H9.5z" fill="#0ACF83" />
                <path d="M19 0H9.5A9.5 9.5 0 0 0 9.5 19H19V0z" fill="#FF7262" />
                <path d="M28.5 0H19v19h9.5A9.5 9.5 0 1 0 28.5 0z" fill="#F24E1E" />
                <path d="M38 19a9.5 9.5 0 1 1-9.5-9.5H38V19z" fill="#A259FF" />
              </svg>
              Figma
            </a>
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 className="text-white font-semibold mb-4 text-sm">تسليم المهمة</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">رابط المشروع</label>
              <input type="url" placeholder="https://..." dir="ltr"
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                value={taskLink} onChange={(e) => setTaskLink(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">أو صورة من التصميم</label>
              {!taskImage ? (
                <label className="flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.15)' }}>
                  {taskUploading
                    ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
                    : <><FaImage className="text-indigo-400 text-3xl mb-2" /><p className="text-xs text-gray-400">انقر لرفع الصورة</p></>}
                  <input type="file" className="hidden" accept="image/*" onChange={handleTaskImageChange} disabled={taskUploading} />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden max-w-xs">
                  <img src={generateFileUrl(taskImage)} alt="task" className="w-full" />
                  <button onClick={() => setTaskImage('')}
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white text-xs">
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          </div>
            <button onClick={handleSubmitEntryExam} disabled={entryExamSubmitting || (!taskLink && !taskImage)}
            className="mt-5 w-full py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{ background: (!taskLink && !taskImage) ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.8)', color: 'white' }}>
            <FaPaperPlane className="text-xs" />
            {entryExamSubmitting ? 'جاري الإرسال...' : 'تسليم المهمة'}
          </button>
        </div>
      </div>
    );

    // MCQ start screen
    if (!entryExamStarted) return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)' }}>
          <FaLockOpen className="text-indigo-400 text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{entryExam.title || 'كويز فتح المحتوى'}</h3>
        {entryExam.description && <p className="text-gray-400 text-sm mb-4">{entryExam.description}</p>}
        <div className="flex items-center justify-center gap-8 mb-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{entryExam.questionsCount || entryExam.questions?.length}</div>
            <div className="text-gray-500 text-xs mt-0.5">سؤال</div>
          </div>
          <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{entryExam.timeLimit || 15}</div>
            <div className="text-gray-500 text-xs mt-0.5">دقيقة</div>
          </div>
        </div>
        <button onClick={() => { setEntryExamStarted(true); setEntryExamStartTime(new Date()); }}
          className="flex items-center gap-2 mx-auto px-8 py-3 rounded-lg font-bold text-white" style={{ background: 'rgba(99,102,241,0.8)' }}>
   ابدأ الامتحان
        </button>
      </div>
    );

    // MCQ questions
    return (
      <div className="space-y-4">
        {entryExam.questions?.map((q, qi) => (
          <div key={qi} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-white font-medium mb-3 text-sm">{qi + 1}. {q.question}</p>
            {q.image && (
              <img
                src={generateFileUrl(q.image)}
                alt={`سؤال ${qi + 1}`}
                className="max-w-md rounded-xl mb-3 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                onClick={() => { setCurrentImageUrl(generateFileUrl(q.image)); setImageViewerOpen(true); }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="space-y-2">
              {q.options?.slice(0, q.numberOfOptions || 4).map((opt, oi) => (
                <button key={oi} onClick={() => setEntryExamAnswers((p) => ({ ...p, [qi]: oi }))}
                  className="w-full text-right px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: entryExamAnswers[qi] === oi ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.04)',
                    border: entryExamAnswers[qi] === oi ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
                    color: entryExamAnswers[qi] === oi ? '#a5b4fc' : '#d1d5db',
                  }}>
                  {String.fromCharCode(65 + oi)}. {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="text-center pt-2">
          <button onClick={handleSubmitEntryExam} disabled={entryExamSubmitting}
            className="flex items-center gap-2 mx-auto px-8 py-2 rounded-lg font-bold text-white text-sm"
            style={{ background: 'rgba(99,102,241,0.8)' }}>
            <FaPaperPlane className="text-xs" />
            {entryExamSubmitting ? 'جاري الإرسال...' : 'إرسال الإجابات'}
          </button>
        </div>
      </div>
    );
  };

  // تاب "كويز" ← الامتحانات العادية + المقالية فقط
  const renderKweizTab = () => {
    if (!activeLessonData) return <div className="text-gray-400 text-center py-8">جاري التحميل...</div>;

    const isLocked = activeLessonData.hasEntryExam && !activeLessonData.contentUnlocked;
    const exams = activeLessonData.exams || [];
    const essayExams = activeLessonData.essayExams || [];
    const lockedExamsCount = activeLessonData.lockedExamsCount || 0;
    const totalExams = exams.length + essayExams.length + lockedExamsCount;

    // محتوى مقفول
    if (isLocked && totalExams > 0) return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <FaLock className="text-yellow-400 text-xl" />
        </div>
        <h3 className="text-white font-bold mb-1">الاختبارات مقفولة</h3>
        <p className="text-gray-400 text-sm mb-1">يوجد <span className="text-yellow-300 font-bold">{totalExams}</span> اختبار بعد فتح المحتوى</p>
        <p className="text-gray-500 text-xs mb-4">أكمل كويز فتح المحتوى أولاً</p>
        <button onClick={() => setActiveTab('كويز فتح المحتوى')}
          className="flex items-center gap-2 mx-auto px-5 py-2 rounded-lg text-sm text-white"
          style={{ background: 'rgba(99,102,241,0.8)' }}>
          <FaLockOpen className="text-xs" /> اذهب لكويز فتح المحتوى
        </button>
      </div>
    );

    const hasContent = exams.length || essayExams.length;
    if (!hasContent) return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <FaClipboardList className="text-gray-500 text-xl" />
        </div>
        <p className="text-gray-400">لا توجد اختبارات لهذا الدرس</p>
      </div>
    );

    const ItemRow = ({ icon, label, sub, color, onStart }) => (
      <div className="flex items-center justify-between rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onStart}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm text-white" style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.4)' }}>
          <FaPlay className="text-xs" /> ابدأ
        </button>
        <div className="text-right flex-1 px-3">
          <div className="text-white text-sm font-medium">{label}</div>
          {sub && <div className="text-gray-500 text-xs">{sub}</div>}
        </div>
        <span style={{ color }}>{icon}</span>
      </div>
    );

    return (
      <div className="space-y-3">
        {exams.map((exam) => (
          <ItemRow key={exam._id} icon={<FaClipboardList />} color="#34d399"
            label={exam.title} sub={`${exam.questionsCount || exam.questions?.length || 0} سؤال`}
            onStart={() => { setSelectedExam(exam); setCurrentExamType('exam'); setExamModalOpen(true); }} />
        ))}
        {essayExams.map((ex) => (
          <ItemRow key={ex._id} icon={<FaClipboardList />} color="#a78bfa"
            label={ex.title} sub="امتحان مقالي"
            onStart={() => { setSelectedEssayExam(ex); setEssayExamModalOpen(true); }} />
        ))}
      </div>
    );
  };

  const renderNazraTab = () => {
    if (!activeLessonData) return <div className="text-gray-400 text-center py-8">جاري التحميل...</div>;

    const d = activeLessonData;
    const description = d.description || '';
    const content = d.content || '';
    const videosCount   = (d.videos?.length || 0) + (d.lockedVideosCount || 0);
    const pdfsCount     = (d.pdfs?.length || 0) + (d.lockedPdfsCount || 0);
    const examsCount    = (d.exams?.length || 0) + (d.lockedExamsCount || 0) + (d.essayExams?.length || 0);
    const trainingsCount= (d.trainings?.length || 0) + (d.lockedTrainingsCount || 0);

    const hasAnything = description || content || videosCount || pdfsCount || examsCount || trainingsCount;

    if (!hasAnything) return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <FaBookOpen className="text-gray-500 text-xl" />
        </div>
        <p className="text-gray-400">لا يوجد وصف لهذا الدرس</p>
      </div>
    );

    return (
      <div className="space-y-5" dir="rtl">

        {/* Description */}
        {description && (
          <div>
            <h4 className="text-white font-semibold text-sm mb-2">وصف الدرس</h4>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>
        )}

        {/* Rich content */}
        {content && (
          <div>
            <h4 className="text-white font-semibold text-sm mb-2">تفاصيل إضافية</h4>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        )}

        {/* Divider */}
        {(description || content) && (videosCount || pdfsCount || examsCount || trainingsCount) > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
        )}

        {/* مشتملات الدرس */}
        {(videosCount || pdfsCount || examsCount || trainingsCount) > 0 && (
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">مشتملات الدرس</h4>
            <div className="grid grid-cols-2 gap-2">
              {videosCount > 0 && (
                <div className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <FaVideo className="text-indigo-400 text-sm" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-base leading-none">{videosCount}</div>
                    <div className="text-gray-400 text-xs mt-0.5">فيديو</div>
                  </div>
                </div>
              )}
              {pdfsCount > 0 && (
                <div className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.12)' }}>
                    <FaFilePdf className="text-red-400 text-sm" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-base leading-none">{pdfsCount}</div>
                    <div className="text-gray-400 text-xs mt-0.5">ملف PDF</div>
                  </div>
                </div>
              )}
              {examsCount > 0 && (
                <div className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.12)' }}>
                    <FaClipboardList className="text-emerald-400 text-sm" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-base leading-none">{examsCount}</div>
                    <div className="text-gray-400 text-xs mt-0.5">اختبار</div>
                  </div>
                </div>
              )}
              {trainingsCount > 0 && (
                <div className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.12)' }}>
                    <FaDumbbell className="text-yellow-400 text-sm" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-base leading-none">{trainingsCount}</div>
                    <div className="text-gray-400 text-xs mt-0.5">تدريب</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // تاب "الملحقات" ← ملفات PDF
  const renderMulahaqatTab = () => {
    if (!activeLessonData) return <div className="text-gray-400 text-center py-8">جاري التحميل...</div>;
    const pdfs = activeLessonData.pdfs || [];
    const lockedPdfsCount = activeLessonData.lockedPdfsCount || 0;
    const isLocked = activeLessonData.hasEntryExam && !activeLessonData.contentUnlocked;

    if (isLocked && (pdfs.length + lockedPdfsCount) > 0) return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <FaLock className="text-yellow-400 text-xl" />
        </div>
        <h3 className="text-white font-bold mb-1">الملفات مقفولة</h3>
        <p className="text-gray-400 text-sm mb-1">يوجد <span className="text-yellow-300 font-bold">{pdfs.length + lockedPdfsCount}</span> ملف بعد فتح المحتوى</p>
        <p className="text-gray-500 text-xs mb-4">أكمل كويز فتح المحتوى أولاً</p>
        <button onClick={() => setActiveTab('كويز فتح المحتوى')}
          className="flex items-center gap-2 mx-auto px-5 py-2 rounded-lg text-sm text-white"
          style={{ background: 'rgba(99,102,241,0.8)' }}>
          <FaLockOpen className="text-xs" /> اذهب لكويز فتح المحتوى
        </button>
      </div>
    );

    if (!pdfs.length) return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <FaFilePdf className="text-gray-500 text-xl" />
        </div>
        <p className="text-gray-400">لا توجد ملحقات لهذا الدرس</p>
      </div>
    );

    return (
      <div className="space-y-2">
        {pdfs.map((pdf, i) => {
          const isFigma = pdf.url?.endsWith('.fig') || pdf.title?.toLowerCase().includes('figma');
          return (
            <div key={pdf._id || i} className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <a href={generateFileUrl(pdf.url)} download target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors p-1 flex-shrink-0">
                <FaDownload className="text-sm" />
              </a>
              <div className="flex items-center gap-2 flex-1 px-3 min-w-0">
                {isFigma
                  ? <svg viewBox="0 0 38 57" className="w-4 h-4 flex-shrink-0" fill="none">
                      <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19H19v9.5z" fill="#1ABCFE"/>
                      <path d="M9.5 47.5A9.5 9.5 0 0 1 19 38v9.5H9.5z" fill="#0ACF83"/>
                      <path d="M19 0H9.5A9.5 9.5 0 0 0 9.5 19H19V0z" fill="#FF7262"/>
                      <path d="M28.5 0H19v19h9.5A9.5 9.5 0 1 0 28.5 0z" fill="#F24E1E"/>
                      <path d="M38 19a9.5 9.5 0 1 1-9.5-9.5H38V19z" fill="#A259FF"/>
                    </svg>
                  : <FaFilePdf className="text-red-400 flex-shrink-0 text-sm" />}
                <span className="text-sm text-gray-200 truncate">{pdf.title || `ملف ${i + 1}`}</span>
              </div>
              {!isFigma && (
                <button onClick={() => { setCurrentPdf(pdf); setPdfViewerOpen(true); }}
                  className="text-indigo-400 hover:text-indigo-300 text-xs px-2 py-1 rounded flex-shrink-0"
                  style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                  عرض
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMunaqashatTab = () => (
    <div className="text-center py-10">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
        <FaComments className="text-indigo-400 text-xl" />
      </div>
      <p className="text-gray-300 text-base mb-4">لديك سؤال؟ تحدث مع المدربين</p>
      <Link to="/qa" className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm text-white"
        style={{ background: 'rgba(99,102,241,0.8)' }}>
        <FaComments className="text-xs" /> اذهب للمناقشات
      </Link>
    </div>
  );

  const renderKweizFatahTrigger = () => {
    if (!activeLessonData) return <div className="text-gray-400 text-center py-8">جاري التحميل...</div>;
    if (!activeLessonData.hasEntryExam) return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <FaCheckCircle className="text-green-400 text-2xl" />
        </div>
        <p className="text-gray-300 text-base">لا يوجد امتحان مدخل لهذا الدرس</p>
      </div>
    );
    const entryExam = activeLessonData.entryExam;
    const userResult = entryExam?.userResult;
    const isTask = entryExam?.type === 'task';
    const isDone = (activeLessonData.contentUnlocked && userResult?.hasTaken) || entryExamResult;

    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: isDone ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)', border: `1px solid ${isDone ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)'}` }}>
          {isDone ? <FaCheckCircle className="text-green-400 text-2xl" /> : <FaLockOpen className="text-indigo-400 text-2xl" />}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{entryExam?.title || 'كويز فتح المحتوى'}</h3>
        {isDone
          ? <p className="text-green-300 text-sm mb-5">تم اجتياز كويز فتح المحتوى بنجاح</p>
          : <p className="text-gray-400 text-sm mb-5">{isTask ? 'سلّم المهمة لفتح محتوى الدرس' : 'أجب على الأسئلة لفتح محتوى الدرس'}</p>
        }
        <button onClick={() => setEntryExamModalOpen(true)}
          className="flex items-center gap-2 mx-auto px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
          style={{ background: isDone ? 'rgba(16,185,129,0.5)' : 'rgba(99,102,241,0.8)' }}>
          {isDone ? <FaCheckCircle className="text-sm" /> : <FaPlay className="text-sm" />}
          {isDone ? 'عرض النتيجة' : 'ابدأ الكويز'}
        </button>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'كويز فتح المحتوى': return renderKweizFatahTrigger();
      case 'واجب': return renderWajibTab();
      case 'كويز': return renderKweizTab();
      case 'نظرة سريعة': return renderNazraTab();
      case 'مناقشات': return renderMunaqashatTab();
      case 'الملحقات': return renderMulahaqatTab();
      default: return null;
    }
  };

  // ── video player area ─────────────────────────────────────────────────────
  const firstVideo = activeLessonData?.videos?.[0];
  const ytId = firstVideo ? extractYouTubeId(firstVideo.url) : null;

  // ── loading / error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1829' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" />
        <p className="text-gray-400">جاري تحميل تفاصيل الكورس...</p>
      </div>
    </div>
  );

  if (!currentCourse) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1829' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <FaExclamationTriangle className="text-red-400 text-2xl" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">الكورس غير موجود</h3>
        <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white mt-4" style={{ background: 'rgba(99,102,241,0.8)' }}>
          <FaArrowRight className="text-sm" /> العودة للكورسات
        </Link>
      </div>
    </div>
  );

  const totalLessons = getTotalLessons(currentCourse);
  const progressPct = totalLessons > 0 ? Math.round(((currentIdx + 1) / totalLessons) * 100) : 0;

  // ── main render ───────────────────────────────────────────────────────────
  return (
    <>
    {/* ── Main App Menu Panel ── */}
    {/* Backdrop */}
    <div
      onClick={() => setMainMenuOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
        opacity: mainMenuOpen ? 1 : 0,
        pointerEvents: mainMenuOpen ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }} />
    {/* Sliding Panel – always left side, pixel-exact */}
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        width: '320px',
        zIndex: 9999,
        transform: mainMenuOpen ? 'translateX(0px)' : 'translateX(-320px)',
        transition: 'transform 0.3s ease',
        background: '#080E1E',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        boxShadow: mainMenuOpen ? '8px 0 40px rgba(0,0,0,0.6)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl',
      }}>
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={() => setMainMenuOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <FaTimes className="text-sm" />
          </button>
          <div className="text-right">
            <div className="font-bold text-sm uppercase tracking-wider text-white">{BRAND?.navbarWordmark || 'MAGDY ACADEMY'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{BRAND?.platformName || 'E-learning Platform'}</div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {[
            { to: '/', label: 'الرئيسية', icon: <FaBookOpen className="text-sm" /> },
            { to: '/courses', label: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? 'جميع الكورسات' : 'كورساتي', icon: <FaClipboardList className="text-sm" /> },
            { to: '/exam-history', label: 'سجل الامتحانات', icon: <FaCheckCircle className="text-sm" /> },
          ].map(({ to, label, icon }) => (
            <button key={to} onClick={() => { navigate(to); setMainMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all mb-1 text-right"
              style={{ border: '1px solid transparent' }}>
              <span className="text-gray-500">{icon}</span>
              {label}
            </button>
          ))}
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <button onClick={() => { navigate('/admin/dashboard'); setMainMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all mb-1 text-right">
              <FaUser className="text-sm text-gray-500" />
              لوحة تحكم الإدارة
            </button>
          )}
        </div>

        {/* Bottom: user + logout */}
        <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6C2BD9,#7C3AED)', border: '2px solid rgba(255,255,255,0.2)' }}>
              {user?.avatar?.secure_url
                ? <img src={generateImageUrl(user.avatar.secure_url)} alt="" className="w-full h-full rounded-full object-cover" />
                : (user?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-white">{user?.fullName || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.role === 'SUPER_ADMIN' ? 'مدير مميز' : user?.role === 'ADMIN' ? 'مدير' : 'طالب'}</div>
            </div>
            <button onClick={() => { dispatch(logout()); navigate('/login'); }}
              className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

    <div className="h-screen flex flex-col" style={{ background: '#0d1829', color: 'white' }} dir="rtl">


      {/* ── Alerts ── */}
      {showSuccessAlert && <PaymentSuccessAlert message={alertMessage} onClose={() => setShowSuccessAlert(false)} />}
      {showErrorAlert && <PaymentErrorAlert message={alertMessage} onClose={() => setShowErrorAlert(false)} />}
      {showWalletAlert && <WalletAlert message={alertMessage} onClose={() => setShowWalletAlert(false)} />}

      {/* ── Navbar ── */}
      <header className="flex items-center justify-between px-5 md:px-8 flex-shrink-0" style={{ background: '#0d1829', borderBottom: '1px solid rgba(255,255,255,0.07)', height: '52px' }}>

        {/* LEFT: Burger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMainSidebar}
            className="flex flex-col items-center justify-center gap-1.5 w-8 h-8 rounded-lg transition-all hover:bg-white/10 flex-shrink-0"
            title="القائمة الرئيسية">
            <span className="block w-5 h-0.5 rounded-full bg-white" />
            <span className="block w-5 h-0.5 rounded-full bg-white" />
            <span className="block w-5 h-0.5 rounded-full bg-white" />
          </button>
          <span className="font-bold tracking-widest text-sm md:text-base text-white select-none">
            {BRAND?.navbarWordmark || 'MAGDYACADEMY'}
          </span>
        </div>

        {/* RIGHT: Curriculum toggle (mobile) + Avatar + Name */}
        <div className="flex items-center gap-2">
        <button onClick={() => setSidebarOpen(v => !v)}
          className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <FaClipboardList className="text-indigo-400 text-xs" /> المحتوى
        </button>
        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 group">
          <span className="hidden sm:block text-white text-sm font-medium group-hover:text-gray-200 transition-colors">
            {user?.fullName || user?.name || 'المستخدم'}
          </span>
          {user?.avatar?.secure_url
            ? <img src={generateImageUrl(user.avatar.secure_url)} alt={user?.fullName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid rgba(255,255,255,0.15)' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.classList?.remove('hidden'); }} />
            : null}
          <div className={`w-8 h-8 rounded-full items-center justify-center flex-shrink-0 text-white font-bold text-sm ${user?.avatar?.secure_url ? 'hidden' : 'flex'}`}
            style={{ background: 'rgba(99,102,241,0.6)', border: '2px solid rgba(99,102,241,0.4)' }}>
            {(user?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
          </div>
        </button>
        </div>

      </header>

      {/* ── Breadcrumb ── */}
      <div className="px-4 md:px-6 py-2 text-xs text-gray-500 flex items-center gap-1.5 flex-shrink-0" dir="ltr">
        <span className="uppercase">Lessons</span>
        <span>›</span>
        {activeLesson?.unitTitle && <><span className="uppercase">{activeLesson.unitTitle}</span><span>›</span></>}
        <span className="text-gray-300 uppercase">{currentCourse.title}</span>
      </div>

      {/* ── Body: two-column layout ── */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row" style={{ direction: 'ltr' }}>

        {/* ── Left: Main Content ── */}
        <div className="flex-1 overflow-y-auto" dir="rtl">
          <div className="p-4 md:p-5">

            {/* Video Player Area */}
            <div className="relative overflow-hidden mb-4 group" style={{ width: '100%', paddingBottom: isMobile ? '56.25%' : '34%', background: '#111827', position: 'relative', borderRadius: isMobile ? '12px' : '16px' }}>
              {/* Thumbnail / background */}
              {ytId && (
                <img src={ytThumb(ytId)} alt={firstVideo?.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: isLessonLocked ? 'rgba(0,0,0,0.75)' : ytId ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.6)' }}>

                {/* Locked: no purchase / access */}
                {isLessonLocked ? (
                  <div className="text-center px-6 max-w-md">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))', border: '2px solid rgba(99,102,241,0.4)' }}>
                      <FaLock className="text-indigo-400 text-2xl" />
                    </div>
                    <h3 className="text-white text-lg font-bold mb-2">هذا المحتوى يحتاج اشتراك</h3>
                    <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                      اشترِ الكورس عشان تقدر تشوف الدروس والفيديوهات
                    </p>
                    <button onClick={handleCoursePurchaseClick}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white font-semibold transition-all hover:scale-105 mx-auto"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      <FaShoppingCart className="text-xs" />
                      شراء الكورس — {currentCourse?.price} جنيه
                    </button>
                  </div>
                ) : activeLessonData?.hasEntryExam && !activeLessonData?.contentUnlocked ? (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <FaLock className="text-yellow-400 text-xl" />
                    </div>
                    <p className="text-white font-semibold mb-1">المحتوى مقفول</p>
                    <p className="text-gray-300 text-sm mb-4">أكمل الواجب لفتح الفيديوهات</p>
                    <button onClick={() => setActiveTab('كويز فتح المحتوى')}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm text-white mx-auto" style={{ background: 'rgba(99,102,241,0.8)' }}>
                      <FaLockOpen className="text-xs" /> افتح كويز المحتوى
                    </button>
                  </div>
                ) : firstVideo ? (
                  /* Play button */
                  <button onClick={() => { setCurrentVideo(firstVideo); setVideoPlayerOpen(true); }}
                    className="flex flex-col items-center gap-3 group/btn">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover/btn:scale-110"
                      style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', border: '2px solid rgba(255,255,255,0.35)' }}>
                      <FaPlay className="text-white text-2xl ml-1" />
                    </div>
                    <span className="text-white text-sm font-medium opacity-90 group-hover/btn:opacity-100">
                      {firstVideo.title || 'شاهد الفيديو'}
                    </span>
                  </button>
                ) : lessonLoading ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/50" />
                ) : (
                  <div className="text-center">
                    <FaVideo className="text-gray-600 text-4xl mb-3 mx-auto" />
                    <p className="text-gray-400 text-sm">
                      {activeLesson ? 'لا يوجد فيديو لهذا الدرس' : 'اختر درسًا من القائمة الجانبية'}
                    </p>
                    {activeLessonData?.videos?.length > 0 && (
                      <button onClick={() => setActiveTab('نظرة سريعة')}
                        className="mt-3 px-4 py-1.5 rounded-lg text-xs text-white" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        عرض جميع الفيديوهات
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Video count badge */}
              {activeLessonData?.videos?.length > 1 && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs text-white"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                  {activeLessonData.videos.length} فيديو
                </div>
              )}
            </div>

            {/* Mobile hint */}
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl mb-3 text-xs font-medium transition-all"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px dashed rgba(99,102,241,0.4)', color: '#a5b4fc' }}>
                <FaClipboardList className="text-indigo-400 text-xs" />
                اضغط هنا لعرض محتوى الكورس
                <FaArrowLeft className="text-indigo-400 text-xs" />
              </button>
            )}

            {/* Navigation + Complete Button (hidden when locked) */}
            {!isLessonLocked && (
            <div className="flex items-center justify-between mb-4 gap-2">
              <button onClick={() => prevLesson && navigateToLesson(prevLesson)}
                disabled={!prevLesson}
                className="flex items-center gap-1 px-2.5 md:px-3 py-2 rounded-lg text-xs md:text-sm transition-all disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <FaArrowRight className="text-xs" /> <span className="hidden xs:inline">السابق</span>
              </button>

              <button onClick={handleCompleteLesson}
                className="flex items-center gap-1.5 px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'rgba(99,102,241,0.85)' }}>
                <FaCheckCircle className="text-xs" />
                {nextLesson ? (isMobile ? 'أكمل وانتقل' : 'أكمل وانتقل للتالي') : 'أكمل الدرس'}
              </button>

              <button onClick={() => nextLesson && navigateToLesson(nextLesson)}
                disabled={!nextLesson}
                className="flex items-center gap-1 px-2.5 md:px-3 py-2 rounded-lg text-xs md:text-sm transition-all disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="hidden xs:inline">التالي</span> <FaArrowLeft className="text-xs" />
              </button>
            </div>
            )}

            {/* Lesson Info Row */}
            <div className="mb-4">
              {/* Title */}
              <h1 className="text-base md:text-xl font-bold mb-2 leading-snug">
                {isLessonLocked ? currentCourse.title : (activeLesson?.title || currentCourse.title)}
              </h1>
              {!isLessonLocked && (
              <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    <FaUser className="text-white text-xs md:text-sm" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-semibold">{currentCourse.instructor?.name || 'أحمد مجدي'}</div>
                    <div className="text-xs text-gray-500">المدرس</div>
                  </div>
                </div>
                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-500"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                    2K
                  </span>
                  {(() => {
                    const totalSeconds = activeLessonData?.videos?.reduce((sum, v) => {
                      const ytId = extractYouTubeId(v.url);
                      const dur = v.duration || (ytId && ytDurations[ytId]) || 0;
                      return sum + dur;
                    }, 0) || 0;
                    if (!totalSeconds) return null;
                    const mins = Math.floor(totalSeconds / 60);
                    const secs = totalSeconds % 60;
                    const label = mins > 0
                      ? (secs > 0 ? `${mins}د ${secs}ث` : `${mins} دقيقة`)
                      : `${secs} ثانية`;
                    return (
                      <span className="flex items-center gap-1">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-500"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        {label}
                      </span>
                    );
                  })()}
                </div>
              </div>
              )}
            </div>

            {isLessonLocked ? (
              /* ── Locked Lesson: purchase / redeem panel ── */
              <div className="rounded-2xl p-6 md:p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <FaBookOpen className="text-indigo-400 text-xl" />
                </div>
                <h3 className="text-white text-lg font-bold mb-2">محتاج اشتراك عشان توصل للمحتوى</h3>
                <p className="text-gray-400 text-sm mb-1 leading-relaxed max-w-md mx-auto">
                  الكورس ده فيه {getTotalLessons(currentCourse)} درس — اشتريه دلوقتي
                </p>
                <p className="text-indigo-400 text-xl font-bold mb-5">{currentCourse.price} جنيه</p>
                <button onClick={handleCoursePurchaseClick}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm text-white font-semibold transition-all hover:scale-105 hover:shadow-lg mx-auto"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                  <FaShoppingCart className="text-xs" />
                  شراء الكورس
                </button>
              </div>
            ) : (
            <>
            {/* Tabs */}
            {(() => {
              const d = activeLessonData;
              const tabBadges = {
                'كويز فتح المحتوى': d?.hasEntryExam ? 1 : 0,
                'واجب': d ? ((d.trainings?.length || 0) + (d.lockedTrainingsCount || 0)) : null,
                'كويز': d ? ((d.exams?.length || 0) + (d.essayExams?.length || 0) + (d.lockedExamsCount || 0)) : null,
                'نظرة سريعة': null,
                'الملحقات': d ? ((d.pdfs?.length || 0) + (d.lockedPdfsCount || 0)) : null,
                'مناقشات': null,
              };
              return isMobile ? (
                /* ── Mobile: pill tabs ── */
                <div className="mb-4 -mx-3">
                  <div className="flex gap-2 overflow-x-auto px-3 pb-1" style={{ scrollbarWidth: 'none' }}>
                    {['كويز فتح المحتوى', 'واجب', 'كويز', 'نظرة سريعة', 'الملحقات', 'مناقشات'].map((tab) => {
                      const badge = tabBadges[tab];
                      const isActive = activeTab === tab;
                      return (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all"
                          style={isActive ? {
                            background: 'rgba(99,102,241,0.9)',
                            color: 'white',
                            boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
                          } : {
                            background: 'rgba(255,255,255,0.07)',
                            color: '#9ca3af',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}>
                          {tab}
                          {badge != null && badge > 0 && (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold"
                              style={{ background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.4)', color: 'white', fontSize: '10px' }}>
                              {badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ── Desktop: underline tabs ── */
                <div className="flex gap-0 mb-5 border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  {['كويز فتح المحتوى', 'واجب', 'كويز', 'نظرة سريعة', 'الملحقات', 'مناقشات'].map((tab) => {
                    const badge = tabBadges[tab];
                    const isActive = activeTab === tab;
                    return (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap flex-shrink-0"
                        style={{ borderColor: isActive ? 'white' : 'transparent', color: isActive ? 'white' : '#6b7280' }}>
                        {tab}
                        {badge != null && badge > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-xs px-1"
                            style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)', color: isActive ? 'white' : '#9ca3af' }}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Tab Content */}
            <div className="min-h-[120px]">
              {lessonLoading
                ? <div className="flex items-center justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" /></div>
                : lessonError
                  ? <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <FaExclamationTriangle className="text-red-400 text-2xl mx-auto mb-2" />
                      <p className="text-red-300 text-sm mb-3">تعذّر تحميل بيانات الدرس</p>
                      <button onClick={refetchLesson} className="px-4 py-1.5 rounded-lg text-xs text-white" style={{ background: 'rgba(99,102,241,0.7)' }}>إعادة المحاولة</button>
                    </div>
                  : renderTabContent()}
            </div>
            </>
            )}

            {/* Remaining days banner */}
            {courseAccessState?.source === 'code' && courseAccessState?.accessEndAt && (
              <div className="mt-4 rounded-xl px-4 py-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <RemainingDaysLabel accessEndAt={courseAccessState.accessEndAt} className="text-sm" showExpiredMessage={!courseAccessState?.hasAccess} />
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Curriculum Sidebar ── */}
        {/* Mobile overlay backdrop */}
        {sidebarOpen && isMobile && (
          <div className="fixed inset-0 z-20" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar: fixed overlay on mobile, collapsible inline on desktop */}
        <div
          dir="rtl"
          className="flex-col flex-shrink-0"
          style={isMobile ? {
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100%',
            width: '85vw',
            maxWidth: '320px',
            zIndex: 30,
            background: '#111827',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            display: 'flex',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
            boxShadow: sidebarOpen ? '-8px 0 32px rgba(0,0,0,0.5)' : 'none',
          } : {
            position: 'relative',
            width: sidebarOpen ? '288px' : '0px',
            minWidth: sidebarOpen ? '288px' : '0px',
            background: '#111827',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            display: 'flex',
            transition: 'width 0.3s ease, min-width 0.3s ease',
          }}>

          {/* Header */}
          <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white text-sm">Course Curriculum</h2>
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
            {/* Progress bar */}
            <div className="relative h-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#14b8a6,#06b6d4)' }} />
            </div>
            <div className="text-xs text-gray-500">
              {progressPct}% COMPLETED &bull; {currentIdx >= 0 ? currentIdx + 1 : 0}/{totalLessons} LESSONS
            </div>
          </div>

          {/* Lessons list */}
          <div className="flex-1 overflow-y-auto">
            {/* Direct lessons */}
            {currentCourse.directLessons && currentCourse.directLessons.length > 0 && (
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-4 pt-4 pb-2">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wide">المقدمة</div>
                </div>
                {currentCourse.directLessons.map((lesson) => {
                  const isActive = lesson._id === activeLesson?.lessonId;
                  return (
                    <button key={lesson._id} onClick={() => handleLessonClick(lesson, null, null, null)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-right transition-all"
                      style={{ background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent' }}>
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ border: isActive ? '2px solid #818cf8' : '2px solid rgba(255,255,255,0.2)', background: isActive ? 'rgba(99,102,241,0.25)' : 'transparent' }}>
                        {isActive && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate" style={{ color: isActive ? 'white' : '#9ca3af' }}>{lesson.title}</div>
                        {isActive && <div className="text-xs text-indigo-400">Active</div>}
                      </div>
                      {!hasContentAccess() && !lesson.isFree && <FaLock className="text-gray-600 text-xs flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Units */}
            {currentCourse.units?.map((unit, ui) => {
                  return (
                <div key={unit._id || ui} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Unit header */}
                  <button onClick={() => {
                    setExpandedUnits((prev) => {
                      const n = new Set(prev);
                      if (n.has(unit._id || ui)) n.delete(unit._id || ui); else n.add(unit._id || ui);
                      return n;
                    });
                  }}
                    className="w-full flex items-center justify-between px-4 pt-4 pb-2 text-right">
                    <FaChevronDown className="text-gray-600 text-xs flex-shrink-0" style={{ transform: !expandedUnits.has(unit._id || ui) ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wide truncate">
                        UNIT {String(ui + 1).padStart(2, '0')}: {unit.title}
                      </div>
                      <div className="text-xs text-gray-600">{unit.lessons?.length || 0} دروس</div>
                    </div>
                  </button>

                  {/* Lessons */}
                  {!expandedUnits.has(unit._id || ui) && unit.lessons?.map((lesson) => {
                    const isActive = lesson._id === activeLesson?.lessonId;
                    return (
                      <button key={lesson._id} onClick={() => handleLessonClick(lesson, unit._id, unit.title, ui)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-right transition-all"
                        style={{ background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent' }}>
                        <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ border: isActive ? '2px solid #818cf8' : '2px solid rgba(255,255,255,0.15)', background: isActive ? 'rgba(99,102,241,0.25)' : 'transparent' }}>
                          {isActive && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate" style={{ color: isActive ? 'white' : '#9ca3af' }}>{lesson.title}</div>
                          {isActive && <div className="text-xs text-indigo-400">Active</div>}
                        </div>
                        {!hasContentAccess() && !lesson.isFree && !unit.isFree && <FaLock className="text-gray-600 text-xs flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Student Support */}
          <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">STUDENT SUPPORT</div>
            <p className="text-xs text-gray-500 mb-3">Stuck on a concept? Ask our mentors.</p>
            <a href="https://wa.me/201500814250?text=مرحباً، أود الاستفسار" target="_blank" rel="noopener noreferrer"
              className="block w-full text-center py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              What App
            </a>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Entry Exam Modal Popup */}
      {entryExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col" dir="rtl"
            style={{ background: '#0d1829', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-white font-bold text-base">
                كويز فتح المحتوى
              </h3>
              <button onClick={() => setEntryExamModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <FaTimes />
              </button>
            </div>
            {/* Content */}
            <div className="p-5 flex-1">
              {renderKweizFatahTab()}
            </div>
          </div>
        </div>
      )}

      {/* Custom Video Player */}
      {videoPlayerOpen && currentVideo && (
        <CustomVideoPlayer
          video={currentVideo}
          isOpen={videoPlayerOpen}
          onClose={() => { setVideoPlayerOpen(false); setCurrentVideo(null); }}
          onNext={() => {
            if (!activeLessonData?.videos) return;
            const ci = activeLessonData.videos.findIndex((v) => v._id === currentVideo._id);
            if (ci < activeLessonData.videos.length - 1) setCurrentVideo(activeLessonData.videos[ci + 1]);
          }}
          onPrevious={() => {
            if (!activeLessonData?.videos) return;
            const ci = activeLessonData.videos.findIndex((v) => v._id === currentVideo._id);
            if (ci > 0) setCurrentVideo(activeLessonData.videos[ci - 1]);
          }}
          hasNext={activeLessonData?.videos ? activeLessonData.videos.findIndex((v) => v._id === currentVideo._id) < activeLessonData.videos.length - 1 : false}
          hasPrevious={activeLessonData?.videos ? activeLessonData.videos.findIndex((v) => v._id === currentVideo._id) > 0 : false}
          courseTitle={activeLesson?.title || currentCourse.title}
          userName={user?.fullName || user?.name || 'User'}
          courseId={id}
          showProgress={true}
          savedProgress={null}
        />
      )}

      {/* Exam Modal */}
      {examModalOpen && selectedExam && (
        <ExamModal
          isOpen={examModalOpen}
          onClose={() => { setExamModalOpen(false); setSelectedExam(null); refetchLesson(); }}
          exam={selectedExam}
          courseId={id}
          lessonId={activeLesson?.lessonId}
          unitId={activeLesson?.unitId}
          examType={currentExamType}
        />
      )}

      {/* Essay Exam Modal */}
      {essayExamModalOpen && selectedEssayExam && (
        <EssayExamModal
          isOpen={essayExamModalOpen}
          onClose={() => { setEssayExamModalOpen(false); setSelectedEssayExam(null); refetchLesson(); }}
          exam={selectedEssayExam}
          courseId={id}
          lessonId={activeLesson?.lessonId}
          unitId={activeLesson?.unitId}
        />
      )}

      {/* Image Viewer */}
      {imageViewerOpen && currentImageUrl && (
        <ImageViewer
          isOpen={imageViewerOpen}
          onClose={() => { setImageViewerOpen(false); setCurrentImageUrl(''); }}
          imageUrl={currentImageUrl}
          title="صورة السؤال"
        />
      )}

      {/* PDF Viewer */}
      {pdfViewerOpen && currentPdf && (
        <PDFViewer
          isOpen={pdfViewerOpen}
          onClose={() => { setPdfViewerOpen(false); setCurrentPdf(null); }}
          pdfUrl={generateFileUrl(currentPdf.url)}
          title={currentPdf.title || 'ملف PDF'}
        />
      )}

      {/* Legacy lesson modal (fallback for admin preview) */}
      {selectedLesson && showLessonModal && (
        <OptimizedLessonContentModal
          isOpen={showLessonModal}
          onClose={() => { setShowLessonModal(false); setSelectedLesson(null); }}
          courseId={selectedLesson.courseId}
          lessonId={selectedLesson.lessonId}
          unitId={selectedLesson.unitId}
          lessonTitle={selectedLesson.title}
          courseAccessState={courseAccessState}
        />
      )}

      {/* Course Purchase Confirmation Modal */}
      {showCoursePurchaseModal && currentCourse && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl w-full max-w-md" style={{ background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={() => setShowCoursePurchaseModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              <h3 className="font-bold text-white">تأكيد شراء الكورس</h3>
            </div>
            <div className="p-5 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.2)' }}>
                <FaShoppingCart className="text-indigo-400 text-2xl" />
              </div>
              <h4 className="text-white font-semibold mb-1">{currentCourse.title}</h4>
              <p className="text-gray-400 text-sm mb-4">سعر الكورس: <span className="text-indigo-400 font-bold">{currentCourse.price} جنيه</span></p>
              <p className="text-gray-400 text-sm mb-1">رصيد المحفظة: <span className="text-green-400 font-bold">{walletBalance} جنيه</span></p>
              {walletBalance >= currentCourse.price
                ? <p className="text-green-400 text-sm mb-5">الرصيد بعد الشراء: {walletBalance - currentCourse.price} جنيه</p>
                : <p className="text-red-400 text-sm mb-5">الرصيد غير كافٍ</p>}
              <div className="flex gap-3">
                <button onClick={() => setShowCoursePurchaseModal(false)} className="flex-1 py-2 rounded-lg text-sm text-gray-300" style={{ background: 'rgba(255,255,255,0.07)' }}>إلغاء</button>
                <button onClick={handleCoursePurchase} disabled={paymentLoading || walletBalance < currentCourse.price}
                  className="flex-1 py-2 rounded-lg text-sm text-white font-bold disabled:opacity-50" style={{ background: 'rgba(99,102,241,0.8)' }}>
                  {paymentLoading ? 'جاري الشراء...' : 'تأكيد الشراء'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
