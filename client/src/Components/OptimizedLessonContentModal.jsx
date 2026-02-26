import React, { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaFilePdf, FaVideo, FaClipboardList, FaDumbbell, FaPlay, FaEye, FaSpinner, FaCheckCircle, FaTrophy, FaClock, FaImage, FaDownload } from 'react-icons/fa';

import CustomVideoPlayer from './CustomVideoPlayer';
import PDFViewer from './PDFViewer';
import ImageViewer from './ImageViewer';
import ExamModal from './Exam/ExamModal';
import EssayExamModal from './EssayExamModal';
import useLessonData from '../Helpers/useLessonData';
import { generateFileUrl } from "../utils/fileUtils";
import RemainingDaysLabel from './RemainingDaysLabel';
import { axiosInstance } from '../Helpers/axiosInstance';

const OptimizedLessonContentModal = ({ isOpen, onClose, courseId, lessonId, unitId = null, lessonTitle = "درس", courseAccessState = null }) => {
  const { data: userData } = useSelector((state) => state.auth);
  const { coursePurchaseStatus } = useSelector((state) => state.payment);
  const navigate = useNavigate();
  const { lesson, courseInfo, loading, error, refetch } = useLessonData(courseId, lessonId, unitId);

  const isLessonFree = lesson?.isFree || (!lesson?.price || lesson.price <= 0);

  // Check if the entire course is purchased
  const isCoursePurchased = coursePurchaseStatus?.[courseId] || false;

  // Check if access has expired (admin users, free lessons, and purchased courses are exempt)
  const isAccessExpired = !isLessonFree && !isCoursePurchased &&
    (!userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN')) &&
    courseAccessState?.source === 'code' && courseAccessState?.accessEndAt &&
    new Date(courseAccessState.accessEndAt) <= new Date();

  const [selectedTab, setSelectedTab] = useState('video');
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentExamType, setCurrentExamType] = useState('exam');
  const [essayExamModalOpen, setEssayExamModalOpen] = useState(false);
  const [selectedEssayExam, setSelectedEssayExam] = useState(null);

  // CustomVideoPlayer state
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // PDFViewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);

  // ImageViewer state
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);


  // Reset tab when lesson changes
  useEffect(() => {
    if (lesson) {
      // Auto-select first available content type
      if (lesson.videos?.length > 0) setSelectedTab('video');
      else if (lesson.pdfs?.length > 0) setSelectedTab('pdf');
      else if (lesson.exams?.length > 0) setSelectedTab('exam');
      else if (lesson.essayExams?.length > 0) setSelectedTab('essayExam');
      else if (lesson.trainings?.length > 0) setSelectedTab('training');
    }
  }, [lesson]);

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return <FaVideo className="text-green-500" />;
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'exam': return <FaClipboardList className="text-green-500" />;
      case 'essayExam': return <FaClipboardList className="text-purple-500" />;
      case 'training': return <FaDumbbell className="text-green-500" />;
      default: return null;
    }
  };

  const getContentTypeText = (type) => {
    switch (type) {
      case 'video': return 'الفيديوهات';
      case 'pdf': return 'الملفات';
      case 'exam': return 'الامتحانات';
      case 'essayExam': return 'الامتحانات المقالية';
      case 'training': return 'التدريبات';
      default: return '';
    }
  };

  const handleStartExam = (examOrTraining, type = 'exam') => {
    setSelectedExam(examOrTraining);
    setCurrentExamType(type);
    setExamModalOpen(true);
  };

  const handleCloseExam = () => {
    setExamModalOpen(false);
    setSelectedExam(null);
    // Refetch lesson data to get updated exam results
    refetch();
  };

  const handleClearExamAttempt = async (examId) => {
    try {
      const response = await fetch(`/api/v1/exams/clear/${courseId}/${lessonId}/${examId}${unitId ? `?unitId=${unitId}` : ''}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refetch lesson data to update the UI
        refetch();
        alert('تم مسح محاولة الامتحان بنجاح');
      } else {
        const errorData = await response.json();
        alert(`فشل في مسح محاولة الامتحان: ${errorData.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      alert('حدث خطأ أثناء مسح محاولة الامتحان');
    }
  };

  const handleClearTrainingAttempt = async (trainingId) => {
    try {
      const response = await fetch(`/api/v1/exams/clear/${courseId}/${lessonId}/${trainingId}${unitId ? `?unitId=${unitId}` : ''}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refetch lesson data to update the UI
        refetch();
        alert('تم مسح محاولة التدريب بنجاح');
      } else {
        const errorData = await response.json();
        alert(`فشل في مسح محاولة التدريب: ${errorData.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      alert('حدث خطأ أثناء مسح محاولة التدريب');
    }
  };

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+).*&si=/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)\?si=/
    ];

    for (let i = 0; i < patterns.length; i++) {
      const match = url.match(patterns[i]);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (videoId) => {
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const convertUrl = (url) => {
    if (!url) return null;

    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a local file path, generate the proper API URL
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      return generateFileUrl(url);
    }

    // If it's just a filename, assume it's in the pdfs folder
    return generateFileUrl(url, 'pdfs');
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const extension = url.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
  };


  const handleUrlChange = (e) => {
    const url = e.target.value;
    setInputUrl(url);

    // Convert the URL immediately
    const convertedUrl = convertUrl(url);
    setConvertedUrl(convertedUrl);
  };

  // Entry Exam / Task state
  const [entryExamAnswers, setEntryExamAnswers] = useState({});
  const [taskLink, setTaskLink] = useState('');
  const [taskImage, setTaskImage] = useState('');
  const [taskUploading, setTaskUploading] = useState(false);
  const [entryExamSubmitting, setEntryExamSubmitting] = useState(false);
  const [entryExamResult, setEntryExamResult] = useState(null);
  const [entryExamStartTime, setEntryExamStartTime] = useState(null);
  const [entryExamStarted, setEntryExamStarted] = useState(false);

  const handleEntryExamAnswerSelect = (questionIndex, answerIndex) => {
    setEntryExamAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleTaskImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTaskUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setTaskImage(res.data.url);
      } else {
        alert(res.data.message || 'فشل في رفع الصورة');
      }
    } catch (err) {
      alert('فشل في رفع الصورة');
    } finally {
      setTaskUploading(false);
    }
  };

  const handleSubmitEntryExam = async () => {
    const isTask = lesson.entryExam?.type === 'task';

    if (!isTask) {
      if (!lesson.entryExam?.questions?.length) return;

      const answersArray = Object.keys(entryExamAnswers).map(key => ({
        questionIndex: parseInt(key),
        selectedAnswer: entryExamAnswers[key]
      }));

      if (answersArray.length < lesson.entryExam.questions.length) {
        alert('يرجى الإجابة على جميع الأسئلة قبل إرسال الامتحان');
        return;
      }

      setEntryExamSubmitting(true);
      try {
        const response = await axiosInstance.post('/exams/entry', {
          courseId,
          lessonId,
          unitId,
          answers: answersArray,
          startTime: entryExamStartTime?.toISOString() || new Date().toISOString()
        });

        if (response.data.success) {
          setEntryExamResult(response.data.data);
          // Refetch lesson data to update content unlock status
          refetch();
        } else {
          alert(response.data.message || 'حدث خطأ أثناء إرسال الامتحان');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'حدث خطأ أثناء إرسال الامتحان');
      } finally {
        setEntryExamSubmitting(false);
      }
    } else {
      // Handling Task Submission
      if (!taskLink && !taskImage) {
        alert('يرجى إضافة رابط أو صورة للمهمة');
        return;
      }

      setEntryExamSubmitting(true);
      try {
        const response = await axiosInstance.post('/exams/entry', {
          courseId,
          lessonId,
          unitId,
          taskLink,
          taskImage
        });

        if (response.data.success) {
          setEntryExamResult(response.data.data);
          refetch();
        } else {
          alert(response.data.message || 'حدث خطأ أثناء إرسال المهمة');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'حدث خطأ أثناء إرسال المهمة');
      } finally {
        setEntryExamSubmitting(false);
      }
    }
  };

  const renderEntryExamContent = () => {
    if (!lesson.entryExam) return null;

    const isTask = lesson.entryExam.type === 'task';
    const userResult = lesson.entryExam.userResult;

    // Check if the user has a pending or successful task submission
    if (isTask && userResult?.hasTaken) {
      if (userResult.status === 'success') {
        return (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-green-300 dark:border-green-700 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              تم قبول المهمة بنجاح!
            </h3>
            {userResult.adminFeedback && (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg mt-4 mb-4 text-right border-r-4 border-green-500">
                <p className="font-semibold text-gray-800 dark:text-gray-200">ملاحظات المدرب:</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{userResult.adminFeedback}</p>
              </div>
            )}
            <p className="text-green-600 dark:text-green-400 font-medium mt-4">
              المحتوى الآن مفتوح لك - تصفح الفيديوهات والملفات
            </p>
          </div>
        );
      } else if (userResult.status === 'pending') {
        return (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 text-center">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              تم إرسال المهمة بنجاح
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              المهمة قيد المراجعة حالياً. سيتم فتح محتوى الدرس بمجرد اعتمادها واجتيازك لها.
            </p>
          </div>
        );
      } else if (userResult.status === 'failed') {
        return (
          <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-red-300 dark:border-red-700 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              لم يتم اجتياز المهمة
            </h3>
            {userResult.adminFeedback && (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg mt-4 mb-4 text-right border-r-4 border-red-500">
                <p className="font-semibold text-gray-800 dark:text-gray-200">سبب الرفض والملاحظات:</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{userResult.adminFeedback}</p>
              </div>
            )}
            <p className="text-red-600 dark:text-red-400 font-medium mb-6">
              يرجى إعادة المحاولة ورفع المهمة بشكل صحيح لفتح محتوى الدرس.
            </p>
            <button
              onClick={() => handleClearExamAttempt(lesson.entryExam.title ? 'entry' : 'entry')} // Assuming we need an endpoint to allow retry
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-200"
            >
              🔄 إعادة إرسال المهمة
            </button>
          </div>
        );
      }
    }

    // MCQ success logic
    if (!isTask && lesson.contentUnlocked && userResult?.hasTaken) {
      return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-green-300 dark:border-green-700 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            تم اجتياز امتحان المدخل بنجاح!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            النتيجة: {userResult.score} / {userResult.totalQuestions}
          </p>
          <p className="text-green-600 dark:text-green-400 font-medium">
            المحتوى الآن مفتوح لك - تصفح الفيديوهات والملفات
          </p>
        </div>
      );
    }

    // Handle fresh successful submission (local state before refetch catches up)
    if (entryExamResult) {
      if (entryExamResult.status === 'pending') {
        return (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 text-center">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              تم إرسال المهمة بنجاح
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              المهمة قيد المراجعة حالياً. يرجى الانتظار حتى يتم الاعتماد لفتح المحتوى.
            </p>
          </div>
        );
      }
      return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-green-300 dark:border-green-700 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            تم إتمام امتحان المدخل!
          </h3>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4 inline-block">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {entryExamResult.score} / {entryExamResult.totalQuestions}
            </p>
            <p className="text-sm text-gray-500">({entryExamResult.percentage}%)</p>
          </div>
          <p className="text-green-600 dark:text-green-400 font-medium mb-4">
            🔓 المحتوى الآن مفتوح لك!
          </p>
          <button
            onClick={() => setSelectedTab('video')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            اذهب للفيديوهات
          </button>
        </div>
      );
    }

    const entryExam = lesson.entryExam;

    // Show start screen if exam hasn't started and it's MCQ
    if (!isTask && !entryExamStarted) {
      return (
        <div className="bg-gradient-to-br from-green-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-green-300 dark:border-green-700 text-center">
          <div className="text-6xl mb-4">🔓</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            {entryExam.title || 'امتحان المدخل'}
          </h3>
          {entryExam.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{entryExam.description}</p>
          )}

          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-6 inline-block">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {entryExam.questionsCount || entryExam.questions?.length}
                </div>
                <div className="text-sm text-gray-500">عدد الأسئلة</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {entryExam.timeLimit || 15}
                </div>
                <div className="text-sm text-gray-500">دقيقة</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-right">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">📌 تعليمات:</p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>يجب حل هذا الامتحان لفتح باقي محتوى الدرس</li>
              <li>اقرأ كل سؤال بعناية قبل الإجابة</li>
              <li>لا يمكنك العودة بعد إرسال الإجابات</li>
            </ul>
          </div>

          <button
            onClick={() => {
              setEntryExamStarted(true);
              setEntryExamStartTime(new Date());
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 hover:shadow-lg"
          >
            🚀 ابدأ الامتحان
          </button>
        </div>
      );
    }

    if (isTask) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-xl border border-blue-200 dark:border-blue-700 text-right">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              🎯 {entryExam.title || 'مهمة المدخل'}
            </h3>
            {entryExam.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{entryExam.description}</p>
            )}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-r-4 border-blue-500 shadow-sm mt-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">التعليمات المطلوبة:</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{entryExam.taskDescription}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-right">تسليم المهمة</h4>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                  رابط المشروع (إن وجد)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-left outline-none"
                  value={taskLink}
                  onChange={(e) => setTaskLink(e.target.value)}
                  dir="ltr"
                />
              </div>

              <div className="text-center w-full my-4 text-gray-400 font-medium">أو / و</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                  صورة من التصميم أو العمل
                </label>
                {!taskImage ? (
                  <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${taskUploading ? 'bg-gray-100 dark:bg-gray-700 border-gray-400' : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40'}`}>
                    <div className="flex flex-col items-center justify-center space-y-3">
                      {taskUploading ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <FaImage className="w-10 h-10 text-blue-500" />
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">انقر هنا لرفع الصور (JPG, PNG)</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleTaskImageChange} disabled={taskUploading} />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-sm mx-auto">
                    <img src={generateFileUrl(taskImage)} alt="Task Upload" className="w-full h-auto" />
                    <button
                      onClick={() => setTaskImage('')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSubmitEntryExam}
                disabled={entryExamSubmitting || (!taskLink && !taskImage)}
                className={`px-8 py-3 rounded-lg font-bold text-lg w-full sm:w-auto transition-all duration-200 ${(!taskLink && !taskImage)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
              >
                {entryExamSubmitting ? '⏳ جاري الإرسال...' : '📤 تسليم المهمة'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show entry exam questions after start (MCQ only)
    return (
      <div className="space-y-6">
        {/* Exam Header */}
        <div className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-900/30 dark:to-amber-900/30 p-4 rounded-xl">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            🔓 {entryExam.title || 'امتحان المدخل'}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>⏱️ الوقت المحدد: {entryExam.timeLimit || 15} دقيقة</span>
            <span>📝 عدد الأسئلة: {entryExam.questionsCount || entryExam.questions?.length}</span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {entryExam.questions?.map((question, qIndex) => (
            <div key={qIndex} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                  {qIndex + 1}
                </span>
                <p className="font-medium text-gray-800 dark:text-gray-200 flex-1">{question.question}</p>
              </div>

              {question.image && (
                <img src={generateFileUrl(question.image)} alt="Question" className="w-full max-w-md rounded-lg mb-4" />
              )}

              <div className="space-y-2">
                {question.options?.slice(0, question.numberOfOptions || 4).map((option, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => handleEntryExamAnswerSelect(qIndex, oIndex)}
                    className={`w-full text-right p-3 rounded-lg border-2 transition-all duration-200 ${entryExamAnswers[qIndex] === oIndex
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
                      }`}
                  >
                    <span className="font-medium ml-2">{String.fromCharCode(65 + oIndex)}.</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            تم الإجابة على {Object.keys(entryExamAnswers).length} من {entryExam.questions?.length} سؤال
          </p>
          <button
            onClick={handleSubmitEntryExam}
            disabled={entryExamSubmitting || Object.keys(entryExamAnswers).length < (entryExam.questions?.length || 0)}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${Object.keys(entryExamAnswers).length >= (entryExam.questions?.length || 0)
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {entryExamSubmitting ? '⏳ جاري الإرسال...' : '📤 إرسال الإجابات'}
          </button>
        </div>
      </div>
    );
  };

  const renderVideoContent = () => {
    // Check if content is locked (entry exam required)
    if (lesson.hasEntryExam && !lesson.contentUnlocked) {
      return (
        <div className="bg-gradient-to-br from-green-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-green-300 dark:border-green-700 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            المحتوى مقفول
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            يجب عليك حل امتحان المدخل أولاً لفتح الفيديوهات
          </p>
          {lesson.lockedVideosCount > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400">
              يوجد {lesson.lockedVideosCount} فيديو في انتظارك بعد حل امتحان المدخل
            </p>
          )}
          <button
            onClick={() => setSelectedTab('entryExam')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          >
            🔓 اذهب لامتحان المدخل
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lesson.videos?.map((video, index) => (
          <div key={video._id} className="bg-gradient-to-br from-green-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-gray-700">
            <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{video.description}</div>
            {video.publishDate && (
              <div className="mb-3 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <FaClock />
                <span>تاريخ النشر: {new Date(video.publishDate).toLocaleDateString('ar')} {new Date(video.publishDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            {video.url ? (
              <div className="relative bg-black rounded-lg overflow-hidden shadow-lg aspect-video cursor-pointer group">
                {/* YouTube Thumbnail Background */}
                {(() => {
                  const videoId = extractYouTubeVideoId(video.url);
                  const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : '';
                  return thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {

                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(to bottom right, #1f2937, #111827)';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                  );
                })()}

                {/* Play Button Overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition-all duration-200"
                  onClick={() => {
                    // Check if access has expired before opening video
                    if (isAccessExpired) {
                      return;
                    }
                    setCurrentVideo(video);
                    setVideoPlayerOpen(true);
                  }}
                >
                  <div className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-4 group-hover:bg-white/30 transition-all duration-200 transform group-hover:scale-110">
                      <FaPlay className="text-white text-4xl ml-2" />
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">{video.title}</h3>
                    <p className="text-gray-300 text-sm">انقر لمشاهدة الفيديو</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-8 text-center">
                <FaPlay className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">لا يوجد رابط للفيديو</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPdfContent = () => {
    // Check if content is locked (entry exam required)
    if (lesson.hasEntryExam && !lesson.contentUnlocked) {
      return (
        <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-red-300 dark:border-red-700 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            الملفات مقفولة
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            يجب عليك حل امتحان المدخل أولاً لفتح الملفات
          </p>
          {lesson.lockedPdfsCount > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400">
              يوجد {lesson.lockedPdfsCount} ملف في انتظارك بعد حل امتحان المدخل
            </p>
          )}
          <button
            onClick={() => setSelectedTab('entryExam')}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          >
            🔓 اذهب لامتحان المدخل
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lesson.pdfs?.map((pdf, index) => {
          const isImage = isImageFile(pdf.url);
          return (
            <div key={pdf._id} className={`bg-gradient-to-br ${isImage ? 'from-blue-50 to-cyan-100' : 'from-red-50 to-pink-100'} dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border ${isImage ? 'border-blue-200' : 'border-red-200'} dark:border-gray-700`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 ${isImage ? 'bg-blue-100 dark:bg-blue-900' : 'bg-red-100 dark:bg-red-900'} rounded-lg`}>
                  {isImage ? (
                    <FaImage className="text-blue-600 dark:text-blue-400 text-lg sm:text-xl" />
                  ) : (
                    <FaFilePdf className="text-red-600 dark:text-red-400 text-lg sm:text-xl" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{pdf.title || pdf.fileName}</div>
                  <div className={`text-sm ${isImage ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'} font-medium`}>
                    {isImage ? 'صورة' : 'ملف PDF'}
                  </div>
                  {pdf.publishDate && (
                    <div className="mt-1 flex items-center gap-2 text-green-600 dark:text-green-400 text-xs">
                      <FaClock />
                      <span>تاريخ النشر: {new Date(pdf.publishDate).toLocaleDateString('ar')} {new Date(pdf.publishDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isImage ? (
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={generateFileUrl(pdf.url)}
                          alt={pdf.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Image'; }}
                        />
                      </div>
                    ) : (
                      <FaFilePdf className="text-red-500 text-xl sm:text-2xl flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base break-words">{pdf.title || pdf.fileName}</div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {isImage ? 'عرض الصورة' : 'مستند PDF قابل للعرض'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        // Check if access has expired before opening
                        if (isAccessExpired) {
                          return;
                        }
                        if (isImage) {
                          setCurrentImage(pdf);
                          setImageViewerOpen(true);
                        } else {
                          setCurrentPdf(pdf);
                          setPdfViewerOpen(true);
                        }
                      }}
                      className={`flex-1 sm:flex-none flex items-center gap-2 ${isImage ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg text-sm sm:text-base justify-center`}
                      disabled={isAccessExpired}
                    >
                      <FaEye />
                      {isImage ? 'عرض الصورة' : 'عرض المستند'}
                    </button>

                    <a
                      href={generateFileUrl(pdf.url)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 sm:flex-none flex items-center gap-2 ${isImage ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-red-100 text-red-700 hover:bg-red-200'} px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium justify-center ${isAccessExpired ? 'opacity-50 pointer-events-none' : ''}`}
                      title="تحميل الملف"
                    >
                      <FaDownload />
                      <span className="hidden sm:inline">تحميل</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };


  const renderExamContent = () => {
    // Check if content is locked (entry exam required)
    if (lesson.hasEntryExam && !lesson.contentUnlocked) {
      return (
        <div className="bg-gradient-to-br from-green-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-green-300 dark:border-green-700 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            الامتحانات مقفولة
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            يجب عليك حل امتحان المدخل أولاً لفتح الامتحانات
          </p>
          {lesson.lockedExamsCount > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400">
              يوجد {lesson.lockedExamsCount} امتحان في انتظارك بعد حل امتحان المدخل
            </p>
          )}
          <button
            onClick={() => setSelectedTab('entryExam')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          >
            🔓 اذهب لامتحان المدخل
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lesson.exams?.map((exam, index) => (
          <div key={exam._id} className="bg-gradient-to-br from-green-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FaClipboardList className="text-green-600 dark:text-green-400 text-lg sm:text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{exam.title}</div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">امتحان </div>
              </div>
              {exam.userResult?.hasTaken && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">النتيجة السابقة</div>
                  <div className="text-lg font-bold text-green-600">{exam.userResult.percentage}%</div>
                </div>
              )}
            </div>

            <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{exam.description}</div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">عدد الأسئلة</div>
                  <div className="text-lg font-semibold">{exam.questionsCount}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">المدة المحددة</div>
                  <div className="text-lg font-semibold">{exam.timeLimit} دقيقة</div>
                </div>
              </div>

              {/* Date Information */}
              {(exam.openDate || exam.closeDate) && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">معلومات التواريخ:</div>
                  <div className="space-y-1 text-xs text-green-700 dark:text-green-400">
                    {exam.openDate && (
                      <div>يفتح في: {new Date(exam.openDate).toLocaleDateString('ar')} {new Date(exam.openDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                    )}
                    {exam.closeDate && (
                      <div>يغلق في: {new Date(exam.closeDate).toLocaleDateString('ar')} {new Date(exam.closeDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-center">
                {exam.userResult?.hasTaken ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <FaCheckCircle />
                      <span>تم إنجاز الامتحان</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      النتيجة: {exam.userResult.score}/{exam.userResult.totalQuestions} ({exam.userResult.percentage}%)
                    </div>
                    <div className="text-xs text-gray-500">
                      تاريخ الامتحان: {new Date(exam.userResult.takenAt).toLocaleDateString('ar')}
                    </div>
                  </div>
                ) : exam.examStatus === 'not_open' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <FaClock />
                      <span>الامتحان غير متاح بعد</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {exam.statusMessage}
                    </div>
                    <button
                      disabled
                      className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed"
                    >
                      الامتحان غير متاح
                    </button>
                  </div>
                ) : exam.examStatus === 'closed' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <FaTimes />
                      <span>الامتحان مغلق</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {exam.statusMessage}
                    </div>
                    <button
                      disabled
                      className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed"
                    >
                      الامتحان مغلق
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      // Check if access has expired before starting exam
                      if (isAccessExpired) {
                        return;
                      }
                      handleStartExam(exam, 'exam');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
                    disabled={isAccessExpired}
                  >
                    بدء الامتحان
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrainingContent = () => {
    // Check if content is locked (entry exam required)
    if (lesson.hasEntryExam && !lesson.contentUnlocked) {
      return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-green-300 dark:border-green-700 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            التدريبات مقفولة
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            يجب عليك حل امتحان المدخل أولاً لفتح التدريبات
          </p>
          {lesson.lockedTrainingsCount > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400">
              يوجد {lesson.lockedTrainingsCount} تدريب في انتظارك بعد حل امتحان المدخل
            </p>
          )}
          <button
            onClick={() => setSelectedTab('entryExam')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          >
            🔓 اذهب لامتحان المدخل
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lesson.trainings?.map((training, index) => (
          <div key={training._id} className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FaDumbbell className="text-green-600 dark:text-green-400 text-lg sm:text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{training.title}</div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">تدريب </div>
              </div>
              {training.attemptCount > 0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">عدد المحاولات</div>
                  <div className="text-lg font-bold text-green-600">{training.attemptCount}</div>
                </div>
              )}
            </div>

            <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{training.description}</div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">عدد الأسئلة</div>
                  <div className="text-lg font-semibold">{training.questionsCount}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">المدة المحددة</div>
                  <div className="text-lg font-semibold">{training.timeLimit} دقيقة</div>
                </div>
              </div>

              {/* Date Information */}
              {(training.openDate || training.closeDate) && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">معلومات التواريخ:</div>
                  <div className="space-y-1 text-xs text-green-700 dark:text-green-400">
                    {training.openDate && (
                      <div>يفتح في: {new Date(training.openDate).toLocaleDateString('ar')} {new Date(training.openDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                    )}
                  </div>
                </div>
              )}

              {training.userResults.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">أفضل نتيجة:</div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.max(...training.userResults.map(r => r.percentage))}%
                  </div>
                </div>
              )}

              <div className="text-center">
                {training.trainingStatus === 'not_open' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <FaClock />
                      <span>التدريب غير متاح بعد</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {training.statusMessage}
                    </div>
                    <button
                      disabled
                      className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed"
                    >
                      التدريب غير متاح
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      // Check if access has expired before starting training
                      if (isAccessExpired) {
                        return;
                      }
                      handleStartExam(training, 'training');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
                    disabled={isAccessExpired}
                  >
                    {training.attemptCount > 0 ? 'إعادة التدريب' : 'بدء التدريب'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEssayExamContent = () => {
    // Check if content is locked (entry exam required)
    if (lesson.hasEntryExam && !lesson.contentUnlocked) {
      return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl border-2 border-purple-300 dark:border-purple-700 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            الامتحانات المقالية مقفولة
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            يجب عليك حل امتحان المدخل أولاً لفتح الامتحانات المقالية
          </p>
          <button
            onClick={() => setSelectedTab('entryExam')}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          >
            🔓 اذهب لامتحان المدخل
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lesson.essayExams?.map((exam, index) => (
          <div key={exam._id} className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-purple-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FaClipboardList className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{exam.title}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">امتحان مقالي</div>
              </div>
              {(() => {
                const userId = userData?._id?.toString();
                const userSubs = (exam.submissions || []).filter(s => (s.user?._id || s.user)?.toString() === userId);
                const hasSubmitted = userSubs.length > 0;
                const totalQuestions = exam.questions?.length || 0;
                const gradedCount = userSubs.filter(s => s.grade != null || s.status === 'graded').length;
                const fullyGraded = hasSubmitted && totalQuestions > 0 && gradedCount >= totalQuestions;
                if (!hasSubmitted) return null;
                return (
                  <div className="text-right">
                    <div className={`text-sm ${fullyGraded ? 'text-green-600' : 'text-gray-500'}`}>{fullyGraded ? 'تم التصحيح' : 'تم التقديم'}</div>
                    <div className="text-lg font-bold text-green-600">✓</div>
                  </div>
                );
              })()}
            </div>

            <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{exam.description}</div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">عدد الأسئلة</div>
                  <div className="text-lg font-semibold">{exam.questions?.length || 0}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">المدة المحددة</div>
                  <div className="text-lg font-semibold">{exam.timeLimit || 60} دقيقة</div>
                </div>
              </div>

              {/* Date Information */}
              {(exam.openDate || exam.closeDate) && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">معلومات التواريخ:</div>
                  <div className="space-y-1 text-xs text-purple-700 dark:text-purple-400">
                    {exam.openDate && (
                      <div>يفتح في: {new Date(exam.openDate).toLocaleDateString('ar')} {new Date(exam.openDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                    )}
                    {exam.closeDate && (
                      <div>يغلق في: {new Date(exam.closeDate).toLocaleDateString('ar')} {new Date(exam.closeDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-center">
                {(() => {
                  const userId = userData?._id?.toString();
                  const userSubs = (exam.submissions || []).filter(s => (s.user?._id || s.user)?.toString() === userId);
                  const hasSubmitted = userSubs.length > 0;
                  const totalQuestions = exam.questions?.length || 0;
                  const gradedCount = userSubs.filter(s => s.grade != null || s.status === 'graded').length;
                  const fullyGraded = hasSubmitted && totalQuestions > 0 && gradedCount >= totalQuestions;

                  if (hasSubmitted) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <FaCheckCircle />
                          <span>{fullyGraded ? 'تم تصحيح الامتحان' : 'تم تقديم الامتحان'}</span>
                        </div>
                        {fullyGraded ? (
                          (() => {
                            const totalGrade = userSubs.reduce((sum, s) => sum + (s.grade ?? 0), 0);
                            const maxTotalGrade = (exam.questions || []).reduce((sum, q) => sum + (q.maxGrade || 0), 0);
                            const feedbackItems = userSubs
                              .map((s) => {
                                const question = (exam.questions || [])[s.questionIndex] || {};
                                return {
                                  idx: s.questionIndex,
                                  text: s.feedback || '',
                                  grade: s.grade ?? null,
                                  max: question.maxGrade || 0
                                };
                              })
                              .filter(f => f.text || f.grade != null);
                            return (
                              <div className="space-y-2">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  درجتك: {totalGrade} / {maxTotalGrade}
                                </div>
                                {feedbackItems.length > 0 && (
                                  <div className="text-right bg-purple-50 dark:bg-gray-700/40 rounded-md p-3">
                                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">ملاحظات المدرس:</div>
                                    <ul className="space-y-1">
                                      {feedbackItems.sort((a, b) => a.idx - b.idx).map((f) => (
                                        <li key={f.idx} className="text-sm text-gray-700 dark:text-gray-200">
                                          <span className="font-medium">السؤال {f.idx + 1}:</span>
                                          {f.text ? <span> {f.text}</span> : null}
                                          {f.grade != null && (
                                            <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">({f.grade} / {f.max})</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-sm text-gray-600">انتظر تقييم المدرس</div>
                        )}
                      </div>
                    );
                  }

                  if (exam.openDate && new Date(exam.openDate) > new Date()) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <FaClock />
                          <span>الامتحان غير متاح بعد</span>
                        </div>
                        <button disabled className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed">
                          الامتحان غير متاح
                        </button>
                      </div>
                    );
                  }

                  if (exam.closeDate && new Date(exam.closeDate) < new Date()) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-red-600">
                          <FaTimes />
                          <span>الامتحان مغلق</span>
                        </div>
                        <button disabled className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed">
                          الامتحان مغلق
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      onClick={() => {
                        if (isAccessExpired) return;
                        setSelectedEssayExam(exam);
                        setEssayExamModalOpen(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
                      disabled={isAccessExpired}
                    >
                      بدء الامتحان المقالي
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  // Block access if code-based access has expired
  if (isAccessExpired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">انتهت صلاحية الوصول</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            انتهت صلاحية الوصول عبر الكود. يرجى إعادة تفعيل كود جديد أو شراء المحتوى.
          </p>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">جاري تحميل محتوى الدرس...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    // Debug: Log the error to see what we're getting

    // Check if it's an authentication error - be more comprehensive
    const isAuthError = error.includes('تسجيل الدخول') ||
      error.includes('لازم تسجل دخول') ||
      error.includes('Unauthorized') ||
      error.includes('401') ||
      error.includes('Authentication') ||
      error.includes('Token') ||
      error.includes('Login required') ||
      error.toLowerCase().includes('unauthorized');

    const handleRetry = () => {
      if (isAuthError) {
        onClose(); // Close the modal first
        navigate('/login'); // Navigate to login page
      } else {
        refetch(); // Normal retry
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">مشكلة في التحميل</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={handleRetry} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg">
                {isAuthError ? 'تسجيل الدخول' : 'إعادة المحاولة'}
              </button>
              <button onClick={onClose} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg">إغلاق</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-600 text-white p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight break-words">{lesson.title}</h2>
              <p className="text-green-100 mt-1 text-sm sm:text-base leading-relaxed break-words">{lesson.description}</p>
              {courseInfo && (
                <p className="text-green-200 mt-1 text-xs sm:text-sm">{courseInfo.title}</p>
              )}

              {/* Show remaining days if user has code-based access */}
              {courseAccessState?.source === 'code' && courseAccessState?.accessEndAt && (
                <div className="mt-3">
                  <RemainingDaysLabel
                    accessEndAt={courseAccessState.accessEndAt}
                    className="bg-white/20 text-white border-white/30"
                    showExpiredMessage={!courseAccessState?.hasAccess}
                  />
                </div>
              )}
            </div>
            <button
              className="text-white hover:text-red-200 text-xl sm:text-2xl transition-colors duration-200 flex-shrink-0 p-1"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Entry Exam Lock Warning Banner */}
        {lesson.hasEntryExam && !lesson.contentUnlocked && (
          <div className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-900/30 dark:to-amber-900/30 border-b border-green-200 dark:border-green-700 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-green-800 dark:text-green-200">
                <span className="text-3xl">🔒</span>
                <div>
                  <p className="font-bold text-lg">امتحان المدخل مطلوب</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    يجب عليك حل امتحان المدخل أولاً لفتح الفيديوهات والملفات
                    {lesson.lockedVideosCount > 0 && ` (${lesson.lockedVideosCount} فيديو`}
                    {lesson.lockedPdfsCount > 0 && ` و ${lesson.lockedPdfsCount} ملف`}
                    {(lesson.lockedVideosCount > 0 || lesson.lockedPdfsCount > 0) && ')'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTab('entryExam')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                🔓 ابدأ الامتحان
              </button>
            </div>
          </div>
        )}

        <div className="p-3 sm:p-6">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-center mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-2 overflow-x-auto">
            {[
              // Entry exam tab (only show if entry exam exists)
              ...(lesson.hasEntryExam ? [{ key: 'entryExam', label: lesson.contentUnlocked ? '✅ امتحان المدخل' : '🔓 امتحان المدخل', icon: <FaClipboardList className="text-green-600" />, count: 1, locked: false, highlight: !lesson.contentUnlocked }] : []),
              { key: 'video', label: 'الفيديوهات', icon: <FaVideo className="text-green-500" />, count: (lesson.videos?.length || 0) + (lesson.lockedVideosCount || 0), locked: lesson.hasEntryExam && !lesson.contentUnlocked },
              { key: 'pdf', label: 'الملفات', icon: <FaFilePdf className="text-red-500" />, count: (lesson.pdfs?.length || 0) + (lesson.lockedPdfsCount || 0), locked: lesson.hasEntryExam && !lesson.contentUnlocked },
              { key: 'exam', label: 'الامتحانات', icon: <FaClipboardList className="text-green-500" />, count: (lesson.exams?.length || 0) + (lesson.lockedExamsCount || 0), locked: lesson.hasEntryExam && !lesson.contentUnlocked },
              { key: 'essayExam', label: 'الامتحانات المقالية', icon: <FaClipboardList className="text-purple-500" />, count: lesson.essayExams?.length || 0, locked: lesson.hasEntryExam && !lesson.contentUnlocked },
              { key: 'training', label: 'التدريبات', icon: <FaDumbbell className="text-green-500" />, count: (lesson.trainings?.length || 0) + (lesson.lockedTrainingsCount || 0), locked: lesson.hasEntryExam && !lesson.contentUnlocked }
            ].filter(tab => tab.count > 0).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 mx-1 flex-shrink-0 ${selectedTab === tab.key
                  ? tab.highlight
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-md'
                  : tab.highlight
                    ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
              >
                {tab.icon}
                <span className="font-medium text-xs sm:text-sm">{tab.label}</span>
                {tab.count > 1 && (
                  <span className={`text-xs px-1 sm:px-2 py-1 rounded-full ${tab.locked ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    {tab.locked && '🔒 '}{tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content Display */}
          <div className="max-h-[60vh] overflow-y-auto">
            {selectedTab === 'entryExam' && renderEntryExamContent()}
            {selectedTab === 'video' && renderVideoContent()}
            {selectedTab === 'pdf' && renderPdfContent()}
            {selectedTab === 'exam' && renderExamContent()}
            {selectedTab === 'essayExam' && renderEssayExamContent()}
            {selectedTab === 'training' && renderTrainingContent()}
          </div>

          {/* Empty State */}
          {(!lesson.videos?.length && !lesson.pdfs?.length && !lesson.exams?.length && !lesson.essayExams?.length && !lesson.trainings?.length) && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📚</div>
              <div className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                لا يوجد محتوى متاح
              </div>
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                لم يتم إضافة أي محتوى لهذا الدرس بعد
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Video Player */}
      {videoPlayerOpen && currentVideo && (() => {
        const userName = userData?.fullName || userData?.name || "User";
        return (
          <CustomVideoPlayer
            video={currentVideo}
            isOpen={videoPlayerOpen}
            onClose={() => {
              setVideoPlayerOpen(false);
              setCurrentVideo(null);
            }}
            onNext={() => {
              const currentIndex = lesson.videos.findIndex(v => v._id === currentVideo._id);
              if (currentIndex < lesson.videos.length - 1) {
                setCurrentVideo(lesson.videos[currentIndex + 1]);
              }
            }}
            onPrevious={() => {
              const currentIndex = lesson.videos.findIndex(v => v._id === currentVideo._id);
              if (currentIndex > 0) {
                setCurrentVideo(lesson.videos[currentIndex - 1]);
              }
            }}
            hasNext={lesson.videos.findIndex(v => v._id === currentVideo._id) < lesson.videos.length - 1}
            hasPrevious={lesson.videos.findIndex(v => v._id === currentVideo._id) > 0}
            courseTitle={lesson?.title || "Course Video"}
            userName={userName}
            courseId={courseId}
            showProgress={true}
            savedProgress={null}
          />
        );
      })()}

      {/* PDF Viewer */}
      {pdfViewerOpen && currentPdf && (() => {
        const pdfUrl = convertUrl(currentPdf.url);

        return (
          <PDFViewer
            pdfUrl={pdfUrl}
            title={currentPdf.title || currentPdf.fileName || "PDF Document"}
            isOpen={pdfViewerOpen}
            onClose={() => {
              setPdfViewerOpen(false);
              setCurrentPdf(null);
            }}
          />
        );
      })()}

      {/* Image Viewer */}
      {imageViewerOpen && currentImage && (
        <ImageViewer
          imageUrl={currentImage.url}
          title={currentImage.title || currentImage.fileName || "Image"}
          isOpen={imageViewerOpen}
          onClose={() => {
            setImageViewerOpen(false);
            setCurrentImage(null);
          }}
        />
      )}


      {/* Exam Modal */}
      {examModalOpen && selectedExam && (
        <ExamModal
          isOpen={examModalOpen}
          onClose={handleCloseExam}
          exam={selectedExam}
          courseId={courseId}
          lessonId={lessonId}
          unitId={unitId}
          examType={currentExamType}
        />
      )}

      {/* Essay Exam Modal */}
      {essayExamModalOpen && selectedEssayExam && (
        <EssayExamModal
          examId={selectedEssayExam._id}
          onClose={() => {
            setEssayExamModalOpen(false);
            setSelectedEssayExam(null);
            refetch(); // Refresh lesson data to show updated submission status
          }}
          onSuccess={() => {
            setEssayExamModalOpen(false);
            setSelectedEssayExam(null);
            refetch(); // Refresh lesson data to show updated submission status
          }}
        />
      )}
    </div>
  );
};

export default OptimizedLessonContentModal;
