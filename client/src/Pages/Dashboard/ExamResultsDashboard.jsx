import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';
import Layout from '../../Layout/Layout';
import {
  FaUsers,
  FaClipboardCheck,
  FaChartBar,
  FaClock,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaTrophy,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaChartLine,
  FaGraduationCap,
  FaBookOpen,
  FaListAlt,
  FaHistory,
  FaChevronRight,
  FaHome,
  FaArrowRight,
  FaChartPie,
  FaMedal
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ExamResultsDashboard = () => {
  const [activeTab, setActiveTab] = useState('all_attempts'); // 'all_attempts', 'by_exam', 'analytics'
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({});
  const [topActiveUsers, setTopActiveUsers] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20, // Default to 20 so pagination is visible
    search: '',
    courseId: '',

    examType: '',
    passed: '',
    sortBy: 'completedAt',
    sortOrder: 'desc',
    lessonId: '' // Added for filtering by specific exam
  });
  const [courses, setCourses] = useState([]);

  const [lessons, setLessons] = useState([]); // State for lessons list
  const [examsList, setExamsList] = useState([]); // Unique list of exams for "By Exam" view
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Local state for search input

  // Pagination for exams list (By Exam tab)
  const [examsPage, setExamsPage] = useState(1);
  const [examsLimit, setExamsLimit] = useState(20);

  // Top performers (highest scores)
  const [topPerformers, setTopPerformers] = useState([]);

  // Get selected course and lesson names for breadcrumb
  const getSelectedCourseName = () => {
    if (!filters.courseId) return null;
    const course = courses.find(c => c._id === filters.courseId);
    return course?.title || 'الدورة المحددة';
  };

  const getSelectedLessonName = () => {
    if (!filters.lessonId) return null;
    const lesson = lessons.find(l => l._id === filters.lessonId);
    return lesson?.title || 'الدرس المحدد';
  };

  // Clear filter functions for breadcrumb navigation
  const clearCourseFilter = () => {
    setFilters(prev => ({ ...prev, courseId: '', lessonId: '', page: 1 }));
  };

  const clearLessonFilter = () => {
    setFilters(prev => ({ ...prev, lessonId: '', page: 1 }));
  };

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fetch courses for filter dropdown
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses');
      if (response.data.success) {
        setCourses(response.data.data.courses || []);
      }
    } catch (error) {
    }
  };

  // Fetch lessons when course is selected
  const fetchLessons = async (courseId) => {
    if (!courseId) {
      setLessons([]);
      return;
    }
    try {
      // Use admin endpoint to get full course data with exams
      const response = await axiosInstance.get(`/courses/admin/${courseId}`);
      if (response.data.success) {
        // Access the course object correctly
        const course = response.data.data.course || response.data.data;
        let allLessons = [];

        // Extract lessons from units with full exam data
        if (course.units && course.units.length > 0) {
          course.units.forEach(unit => {
            if (unit.lessons && unit.lessons.length > 0) {
              // Add unit info to each lesson for reference
              const lessonsWithUnit = unit.lessons.map(lesson => ({
                ...lesson,
                unitId: unit._id,
                unitTitle: unit.title
              }));
              allLessons = [...allLessons, ...lessonsWithUnit];
            }
          });
        }

        // Extract direct lessons
        if (course.directLessons && course.directLessons.length > 0) {
          allLessons = [...allLessons, ...course.directLessons];
        }

        setLessons(allLessons);
      }
    } catch (error) {
    }
  };

  // Effect to fetch lessons when courseId changes
  useEffect(() => {
    fetchLessons(filters.courseId);
  }, [filters.courseId]);
  const fetchExamResults = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await axiosInstance.get(`/exam-results?${queryParams}`);

      if (response.data.success) {

        // Map the backend data structure to frontend expectations
        const results = response.data.data || [];
        const mappedResults = results.map(result => ({
          _id: result.id || result._id,
          user: {
            fullName: result.user?.name || result.user?.fullName,
            email: result.user?.email,
            phoneNumber: result.user?.phoneNumber,
            _id: result.user?.id || result.user?._id
          },
          course: {
            title: result.course?.title,
            _id: result.course?.id || result.course?._id
          },
          lessonId: result.lessonId,
          lessonTitle: result.lesson?.title || result.lessonTitle,
          unitTitle: result.lesson?.unitTitle || result.unitTitle,
          examType: result.exam?.type || result.examType,
          score: result.exam?.score || result.score,
          correctAnswers: result.correctAnswers,
          totalQuestions: result.totalQuestions,
          wrongAnswers: result.wrongAnswers,
          timeTaken: result.timeTaken,
          timeLimit: result.timeLimit,
          passingScore: result.passingScore,
          passed: result.passed,
          completedAt: result.completedAt,
          displayScore: result.totalQuestions > 0 ? Math.round((result.correctAnswers || result.exam?.score || 0) / result.totalQuestions * 100) : 0,
          answers: result.answers || []
        }));

        setExamResults(mappedResults);
        // API returns summary data in either 'statistics' or 'summary' field
        const summaryData = response.data.statistics || response.data.summary || {};
        // Also calculate passRate if not present
        if (summaryData.totalAttempts > 0 && !summaryData.passRate) {
          summaryData.passRate = Math.round((summaryData.passedCount || 0) / summaryData.totalAttempts * 100);
        }

        setSummary(summaryData);
        setPagination(response.data.pagination || {});

        // If in "By Exam" tab, we might need to aggregate unique exams
        // But better to fetch unique exams from a dedicated structure or aggregate locally
        if (activeTab === 'by_exam' && examsList.length === 0) {
          // Basic local aggregation if API doesn't support "get all exams"
          // Ideally we should have an endpoint for "Available Exams"
        }
      }
    } catch (error) {
      toast.error('فشل في تحميل نتائج الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  // Fetch top active users data
  const fetchTopActiveUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);

      if (filters.examType) params.append('examType', filters.examType);
      params.append('minAttempts', '2');
      params.append('limit', '10');
      const response = await axiosInstance.get(`/exam-results/top-active-users?${params.toString()}`);
      if (response.data.success) {
        setTopActiveUsers(response.data.data || []);
      }
    } catch (error) {
    }
  };

  // Fetch top performers (users with highest scores)
  const fetchTopPerformers = async () => {
    try {
      const response = await axiosInstance.get('/exam-results/stats');
      if (response.data.success && response.data.data?.topUsers) {
        setTopPerformers(response.data.data.topUsers || []);
      }
    } catch (error) {
    }
  };

  // Fetch unique exams list from an aggregation endpoint
  // Since we don't have a direct "list all exams" endpoint that gives stats, 
  // we will reuse `getExamStatistics` if course is selected, or try to infer.
  // For now, let's implement a manual aggregation on the client side for the "By Exam" view based on fetched results?
  // No, that only shows current page.
  // Let's assume we use the main table with grouping features visually, or just fetch statistics per course.
  // Actually, let's fetch course stats if course is selected.
  // Fetch unique exams list from backend aggregation - FIXED to fetch all results and aggregate
  const fetchExamStatistics = async (courseId = 'all') => {
    try {
      setLoading(true);

      // Fetch all exam results without pagination to aggregate stats
      const queryParams = new URLSearchParams();
      queryParams.append('limit', '1000'); // Get all results
      if (courseId && courseId !== 'all') {
        queryParams.append('courseId', courseId);
      }

      const response = await axiosInstance.get(`/exam-results?${queryParams}`);

      if (response.data.success) {
        const allResults = response.data.data || [];

        // Aggregate results by lessonId + examType to get unique exams
        const examMap = new Map();

        allResults.forEach(result => {
          const key = `${result.lessonId || result.lesson?._id || 'unknown'}_${result.examType}`;

          if (!examMap.has(key)) {
            examMap.set(key, {
              lessonId: result.lessonId || result.lesson?._id,
              courseId: result.course?._id || result.course,
              courseTitle: result.course?.title || 'غير محدد',
              lessonTitle: result.lessonTitle || result.lesson?.title || 'غير محدد',
              examType: result.examType,
              totalAttempts: 0,
              totalScore: 0,
              passedCount: 0,
              failedCount: 0
            });
          }

          const exam = examMap.get(key);
          exam.totalAttempts++;
          exam.totalScore += (result.score || 0);
          if (result.passed) {
            exam.passedCount++;
          } else {
            exam.failedCount++;
          }
        });

        // Convert map to array and calculate averages
        const flatList = Array.from(examMap.values()).map(exam => ({
          ...exam,
          averageScore: exam.totalAttempts > 0 ? Math.round(exam.totalScore / exam.totalAttempts) : 0,
          passRate: exam.totalAttempts > 0 ? Math.round((exam.passedCount / exam.totalAttempts) * 100) : 0
        }));

        setExamsList(flatList);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamResults();
    fetchCourses();

    fetchTopActiveUsers();
    fetchTopPerformers();
  }, [filters]);

  useEffect(() => {
    if (activeTab === 'by_exam') {
      fetchExamStatistics(filters.courseId || 'all');
    }
  }, [activeTab, filters.courseId]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSort = (column) => {
    const newOrder = filters.sortBy === column && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: newOrder
    }));
  };

  const openDetailsModal = (result) => {
    setSelectedResult(result);
    setShowDetailsModal(true);
  };

  const exportResults = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && key !== 'page' && key !== 'limit') {
          queryParams.append(key, value);
        }
      });

      const response = await axiosInstance.get(`/exam-results/export?${queryParams}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exam-results-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('تم تصدير النتائج بنجاح');
    } catch (error) {
      toast.error('فشل في تصدير النتائج');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-green-600 bg-green-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDuration = (minutes) => {
    const roundedMinutes = Math.round(minutes);
    const hours = Math.floor(roundedMinutes / 60);
    const mins = roundedMinutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins}د`;
  };

  // Chart Data Preparation
  const passFailData = {
    labels: ['ناجح', 'راسب'],
    datasets: [
      {
        data: [summary.passedCount || 0, summary.failedCount || 0],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-8 bg-gray-50 dark:bg-gray-900 font-cairo" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FaClipboardCheck className="text-green-600 text-4xl" />
                <span className="bg-gradient-to-l from-green-600 to-amber-600 bg-clip-text text-transparent">لوحة تحكم النتائج</span>
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">تابع أداء الطلاب ونتائج الامتحانات بشكل مفصل</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95 font-semibold"
              >
                <FaDownload className="text-lg" />
                تصدير Excel
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FaListAlt className="text-6xl text-blue-600" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي المحاولات</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">{summary.totalAttempts || 0}</h3>
                <div className="mt-2 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 inline-block px-2 py-1 rounded-full">
                  + كل المحاولات المسجلة
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FaChartBar className="text-6xl text-green-600" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">متوسط الدرجات</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{Math.round(summary.averageScore || 0)}%</h3>
                <div className={`mt-2 text-xs inline-block px-2 py-1 rounded-full ${summary.averageScore >= 50 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                  {summary.averageScore >= 50 ? 'مستوى جيد' : 'يحتاج تحسين'}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FaCheckCircle className="text-6xl text-green-600" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">نسبة النجاح</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{Math.round(summary.passRate || 0)}%</h3>
                <p className="text-xs text-gray-500 mt-2">
                  {summary.passedCount || 0} ناجح / {summary.failedCount || 0} راسب
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FaClock className="text-6xl text-purple-600" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">متوسط الوقت</p>
                <h3 className="text-3xl font-bold text-purple-600 mt-2">{formatDuration(summary.averageTimeTaken || 0)}</h3>
                <p className="text-xs text-gray-500 mt-2">لكل امتحان</p>
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {(filters.courseId || filters.lessonId) && (
            <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    clearCourseFilter();
                  }}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors font-medium"
                >
                  <FaHome className="text-lg" />
                  <span>جميع الدورات</span>
                </button>

                {filters.courseId && (
                  <>
                    <FaChevronRight className="text-gray-400 dark:text-gray-500" />
                    <button
                      onClick={() => {
                        clearLessonFilter();
                      }}
                      className={`flex items-center gap-2 transition-colors font-medium ${filters.lessonId
                        ? 'text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400'
                        : 'text-green-600 dark:text-green-400'
                        }`}
                    >
                      <FaBookOpen />
                      <span>{getSelectedCourseName()}</span>
                    </button>
                  </>
                )}

                {filters.lessonId && (
                  <>
                    <FaChevronRight className="text-gray-400 dark:text-gray-500" />
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                      <FaClipboardCheck />
                      <span>{getSelectedLessonName()}</span>
                    </span>
                  </>
                )}
              </div>

              {/* Quick clear button */}
              <button
                onClick={clearCourseFilter}
                className="mr-auto px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaArrowRight />
                عرض الكل
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-1">
            <button
              onClick={() => setActiveTab('all_attempts')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'all_attempts' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            >
              <FaListAlt />
              سجل المحاولات
            </button>
            <button
              onClick={() => setActiveTab('by_exam')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'by_exam' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            >
              <FaBookOpen />
              الامتحانات
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            >
              <FaChartLine />
              تحليلات ورسوم بيانية
            </button>
          </div>

          {/* Main Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px]">

            {/* Filters Bar */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="col-span-1 lg:col-span-2 relative">
                <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث باسم الطالب، الإيميل، الهاتف، الدورة..."
                  className="w-full pr-11 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
                />
              </div>

              <select
                value={filters.courseId}
                onChange={(e) => handleFilterChange('courseId', e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
              >
                <option value="">جميع الدورات</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>

              <select
                value={filters.lessonId}
                onChange={(e) => handleFilterChange('lessonId', e.target.value)}
                disabled={!filters.courseId}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">جميع الدروس</option>
                {lessons.map(lesson => (
                  <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                ))}
              </select>

              <select
                value={filters.examType}
                onChange={(e) => handleFilterChange('examType', e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
              >
                <option value="">كل أنواع الامتحانات</option>
                <option value="training">تدريبات</option>
                <option value="final">امتحانات نهائية</option>
              </select>

              <select
                value={filters.passed}
                onChange={(e) => handleFilterChange('passed', e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
              >
                <option value="">كل الحالات</option>
                <option value="true">ناجح</option>
                <option value="false">راسب</option>
              </select>

              {/* Results per page selector */}
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
              >
                <option value={20}>20 نتيجة</option>
                <option value={50}>50 نتيجة</option>
                <option value={100}>100 نتيجة</option>
                <option value={200}>200 نتيجة</option>
                <option value={500}>500 نتيجة</option>
              </select>
            </div>

            {/* Tab Content */}
            {activeTab === 'all_attempts' && (
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
                    <p className="text-gray-500">جاري تحميل البيانات...</p>
                  </div>
                ) : examResults.length > 0 ? (
                  <>
                    <table className="w-full text-right">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm font-medium">
                        <tr>
                          <th className="px-6 py-4">الطالب</th>
                          <th className="px-6 py-4">الدورة / الدرس</th>
                          <th className="px-6 py-4">النتيجة</th>
                          <th className="px-6 py-4">الحالة</th>
                          <th className="px-6 py-4">التاريخ</th>
                          <th className="px-6 py-4">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {examResults.map((result) => (
                          <tr key={result._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                  {result.user?.fullName?.charAt(0) || <FaUsers />}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                                    {result.user?.fullName || 'مستخدم غير معروف'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {result.user?.phoneNumber || result.user?.email || '-'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                  {result.course?.title}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <FaBookOpen className="text-green-500/70" />
                                  {result.lessonTitle}
                                </span>
                                <span className={`text-[10px] mt-1 px-2 py-0.5 rounded-full w-fit ${result.examType === 'final' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {result.examType === 'final' ? 'امتحان نهائي' : 'تدريب'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 overflow-hidden">
                                  <div className={`h-1.5 rounded-full ${result.displayScore >= 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${result.displayScore}%` }}></div>
                                </div>
                                <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{result.displayScore}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {result.passed ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                  <FaCheckCircle /> ناجح
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                                  <FaTimesCircle /> راسب
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{new Date(result.completedAt).toLocaleDateString('ar-EG')}</span>
                                <span className="text-xs opacity-70" dir="ltr">{new Date(result.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => openDetailsModal(result)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-all"
                                title="عرض التفاصيل"
                              >
                                <FaEye className="text-lg" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination - Full featured with page numbers */}
                    <div className="flex flex-col gap-4 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                      {/* Top row: Results info */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            إجمالي النتائج: <strong className="text-green-600 text-lg">{pagination.total || examResults.length}</strong>
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                            | عرض {Math.min(((pagination.currentPage || 1) - 1) * filters.limit + 1, pagination.total || examResults.length)} - {Math.min((pagination.currentPage || 1) * filters.limit, pagination.total || examResults.length)}
                          </span>
                        </div>
                        {pagination.totalPages > 1 && (
                          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            صفحة {pagination.currentPage} من {pagination.totalPages}
                          </span>
                        )}
                      </div>

                      {/* Bottom row: Pagination controls */}
                      {pagination.totalPages > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {/* First Page Button */}
                          <button
                            disabled={pagination.currentPage === 1}
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                            title="الصفحة الأولى"
                          >
                            ⟪
                          </button>

                          {/* Previous Button */}
                          <button
                            disabled={pagination.currentPage === 1}
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                          >
                            السابق
                          </button>

                          {/* Page Number Buttons */}
                          <div className="flex gap-1">
                            {(() => {
                              const pages = [];
                              const currentPage = pagination.currentPage;
                              const totalPages = pagination.totalPages;

                              // Always show first page
                              if (currentPage > 3) {
                                pages.push(
                                  <button
                                    key={1}
                                    onClick={() => handlePageChange(1)}
                                    className="w-10 h-10 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                                  >
                                    1
                                  </button>
                                );
                                if (currentPage > 4) {
                                  pages.push(<span key="dots1" className="px-2 py-2 text-gray-400">...</span>);
                                }
                              }

                              // Show pages around current page
                              for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => handlePageChange(i)}
                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${i === currentPage
                                      ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200'
                                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-600 dark:text-white'
                                      }`}
                                  >
                                    {i}
                                  </button>
                                );
                              }

                              // Always show last page
                              if (currentPage < totalPages - 2) {
                                if (currentPage < totalPages - 3) {
                                  pages.push(<span key="dots2" className="px-2 py-2 text-gray-400">...</span>);
                                }
                                pages.push(
                                  <button
                                    key={totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                    className="w-10 h-10 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                                  >
                                    {totalPages}
                                  </button>
                                );
                              }

                              return pages;
                            })()}
                          </div>

                          {/* Next Button */}
                          <button
                            disabled={pagination.currentPage === pagination.totalPages}
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                          >
                            التالي
                          </button>

                          {/* Last Page Button */}
                          <button
                            disabled={pagination.currentPage === pagination.totalPages}
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                            title="الصفحة الأخيرة"
                          >
                            ⟫
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="bg-gray-100 dark:bg-gray-700/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaClipboardCheck className="text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">لا توجد نتائج</h3>
                    <p className="text-gray-500 mt-2">لم يتم العثور على أي محاولات امتحانات تطابق بحثك.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'by_exam' && (
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
                    <p className="text-gray-500">جاري تحميل قائمة الامتحانات...</p>
                  </div>
                ) : examsList.length > 0 ? (
                  <>
                    <table className="w-full text-right">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm font-medium">
                        <tr>
                          <th className="px-6 py-4">اسم الامتحان</th>
                          <th className="px-6 py-4">الدورة</th>
                          <th className="px-6 py-4">عدد المحاولات</th>
                          <th className="px-6 py-4">نسبة النجاح</th>
                          <th className="px-6 py-4">متوسط الدرجات</th>
                          <th className="px-6 py-4">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {examsList.slice((examsPage - 1) * examsLimit, examsPage * examsLimit).map((exam, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                              {exam.lessonTitle}
                              <span className={`block text-[10px] mt-1 px-2 py-0.5 rounded-full w-fit ${exam.examType === 'final' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {exam.examType === 'final' ? 'امتحان نهائي' : 'تدريب'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {exam.courseTitle}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                              {exam.totalAttempts}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-bold ${exam.passRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                {exam.passRate}%
                              </span>
                              <div className="w-20 bg-gray-200 rounded-full h-1 mt-1 dark:bg-gray-700">
                                <div className={`h-1 rounded-full ${exam.passRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${exam.passRate}%` }}></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-green-600">
                              {Math.round(exam.averageScore)}%
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, courseId: exam.courseId, lessonId: exam.lessonId, examType: exam.examType, page: 1 }));
                                  setActiveTab('all_attempts');
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-semibold transition-colors"
                              >
                                <FaEye /> عرض النتائج
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination for Exams List */}
                    {(() => {
                      const totalExams = examsList.length;
                      const totalExamsPages = Math.ceil(totalExams / examsLimit);

                      return (
                        <div className="flex flex-col gap-4 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                          {/* Top row: Results info */}
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                إجمالي الامتحانات: <strong className="text-green-600 text-lg">{totalExams}</strong>
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                                | عرض {Math.min((examsPage - 1) * examsLimit + 1, totalExams)} - {Math.min(examsPage * examsLimit, totalExams)}
                              </span>
                              {/* Results per page selector */}
                              <select
                                value={examsLimit}
                                onChange={(e) => { setExamsLimit(parseInt(e.target.value)); setExamsPage(1); }}
                                className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
                              >
                                <option value={20}>20 لكل صفحة</option>
                                <option value={50}>50 لكل صفحة</option>
                                <option value={100}>100 لكل صفحة</option>
                                <option value={200}>200 لكل صفحة</option>
                              </select>
                            </div>
                            {totalExamsPages > 1 && (
                              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                صفحة {examsPage} من {totalExamsPages}
                              </span>
                            )}
                          </div>

                          {/* Bottom row: Pagination controls */}
                          {totalExamsPages > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              {/* First Page Button */}
                              <button
                                disabled={examsPage === 1}
                                onClick={() => setExamsPage(1)}
                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                                title="الصفحة الأولى"
                              >
                                ⟪
                              </button>

                              {/* Previous Button */}
                              <button
                                disabled={examsPage === 1}
                                onClick={() => setExamsPage(examsPage - 1)}
                                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                              >
                                السابق
                              </button>

                              {/* Page Number Buttons */}
                              <div className="flex gap-1">
                                {(() => {
                                  const pages = [];
                                  const currentPage = examsPage;

                                  // Always show first page
                                  if (currentPage > 3) {
                                    pages.push(
                                      <button
                                        key={1}
                                        onClick={() => setExamsPage(1)}
                                        className="w-10 h-10 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                                      >
                                        1
                                      </button>
                                    );
                                    if (currentPage > 4) {
                                      pages.push(<span key="dots1" className="px-2 py-2 text-gray-400">...</span>);
                                    }
                                  }

                                  // Show pages around current page
                                  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalExamsPages, currentPage + 2); i++) {
                                    pages.push(
                                      <button
                                        key={i}
                                        onClick={() => setExamsPage(i)}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${i === currentPage
                                          ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200'
                                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-600 dark:text-white'
                                          }`}
                                      >
                                        {i}
                                      </button>
                                    );
                                  }

                                  // Always show last page
                                  if (currentPage < totalExamsPages - 2) {
                                    if (currentPage < totalExamsPages - 3) {
                                      pages.push(<span key="dots2" className="px-2 py-2 text-gray-400">...</span>);
                                    }
                                    pages.push(
                                      <button
                                        key={totalExamsPages}
                                        onClick={() => setExamsPage(totalExamsPages)}
                                        className="w-10 h-10 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                                      >
                                        {totalExamsPages}
                                      </button>
                                    );
                                  }

                                  return pages;
                                })()}
                              </div>

                              {/* Next Button */}
                              <button
                                disabled={examsPage === totalExamsPages}
                                onClick={() => setExamsPage(examsPage + 1)}
                                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                              >
                                التالي
                              </button>

                              {/* Last Page Button */}
                              <button
                                disabled={examsPage === totalExamsPages}
                                onClick={() => setExamsPage(totalExamsPages)}
                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors dark:text-white"
                                title="الصفحة الأخيرة"
                              >
                                ⟫
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="text-center py-20">
                    <FaBookOpen className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">لا توجد امتحانات</h3>
                    <p className="text-gray-500">لم يتم العثور على امتحانات مسجلة.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-8">
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <FaChartPie className="text-green-500" /> نسب النجاح والرسوب
                    </h3>
                    <div className="h-64 flex items-center justify-center relative">
                      {(summary.passedCount > 0 || summary.failedCount > 0) ? (
                        <Doughnut
                          data={passFailData}
                          options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  padding: 20,
                                  font: { size: 14 }
                                }
                              }
                            }
                          }}
                        />
                      ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <FaChartPie className="text-5xl mx-auto mb-4 opacity-30" />
                          <p>لا توجد بيانات كافية لعرض الرسم البياني</p>
                          <p className="text-sm mt-2">يرجى اختيار دورة أو درس لعرض البيانات</p>
                        </div>
                      )}
                    </div>
                    {(summary.passedCount > 0 || summary.failedCount > 0) && (
                      <div className="flex justify-center gap-8 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                          <span className="text-gray-700 dark:text-gray-300">ناجح: {summary.passedCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                          <span className="text-gray-700 dark:text-gray-300">راسب: {summary.failedCount || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Most Active Users */}
                  <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <FaTrophy className="text-yellow-500" /> الطلاب الأكثر نشاطاً
                      <span className="text-xs text-gray-400 font-normal mr-2">(حسب عدد المحاولات)</span>
                    </h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                      {topActiveUsers.map((user, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.02] ${idx === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-700' :
                          idx === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-800 border border-gray-200 dark:border-gray-600' :
                            idx === 2 ? 'bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-900/20 dark:to-amber-900/20 border border-green-200 dark:border-green-700' :
                              'bg-gray-50 dark:bg-gray-800'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                              idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                idx === 2 ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' :
                                  'bg-green-100 text-green-600'
                              }`}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{user.user?.fullName || 'غير معروف'}</p>
                              <p className="text-xs text-gray-500">{user.user?.email || user.user?.phoneNumber || ''}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <span className="block font-bold text-xl text-green-600">{user.attempts}</span>
                            <span className="text-[10px] text-gray-400">محاولة</span>
                          </div>
                        </div>
                      ))}
                      {topActiveUsers.length === 0 && <p className="text-center text-gray-500 py-8">لا توجد بيانات كافية</p>}
                    </div>
                  </div>
                </div>

                {/* Top Performers Row */}
                <div className="grid grid-cols-1 gap-8">
                  <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <FaMedal className="text-purple-500" /> أعلى الدرجات
                      <span className="text-xs text-gray-400 font-normal mr-2">(حسب متوسط الدرجات)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topPerformers.slice(0, 9).map((user, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] ${idx === 0 ? 'bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 dark:from-yellow-900/30 dark:via-amber-900/20 dark:to-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-600 shadow-lg shadow-yellow-100' :
                          idx === 1 ? 'bg-gradient-to-br from-gray-100 via-slate-50 to-gray-100 dark:from-gray-800 dark:via-slate-800 dark:to-gray-800 border-2 border-gray-300 dark:border-gray-500 shadow-lg shadow-gray-100' :
                            idx === 2 ? 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100 dark:from-green-900/30 dark:via-amber-900/20 dark:to-green-900/30 border-2 border-green-300 dark:border-green-600 shadow-lg shadow-green-100' :
                              'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                              idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                idx === 2 ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' :
                                  'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                              }`}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[120px]">{user.userName || 'غير معروف'}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.userEmail || ''}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">{user.passedExams} ناجح</span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">{user.totalExams} امتحان</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${user.averageScore >= 80 ? 'text-green-600' :
                              user.averageScore >= 60 ? 'text-green-600' :
                                'text-red-600'
                              }`}>
                              {Math.round(user.averageScore)}%
                            </div>
                            <span className="text-[10px] text-gray-400">متوسط الدرجات</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1 mx-auto dark:bg-gray-700">
                              <div
                                className={`h-1.5 rounded-full ${user.averageScore >= 80 ? 'bg-green-500' :
                                  user.averageScore >= 60 ? 'bg-green-500' :
                                    'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min(user.averageScore, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {topPerformers.length === 0 && (
                      <div className="text-center py-12">
                        <FaMedal className="text-5xl mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">لا توجد بيانات كافية لعرض أعلى الدرجات</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-xl font-bold">
                    {selectedResult.score}%
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل الامتحان</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <FaClock size={12} /> {new Date(selectedResult.completedAt).toLocaleString('ar-EG')}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-red-500 transition-colors text-xl">
                  <FaTimesCircle />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                    <p className="text-xs text-gray-500 mb-1">نتيجة الطالب</p>
                    <p className={`text-xl font-bold ${selectedResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedResult.passed ? 'ناجح' : 'راسب'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                    <p className="text-xs text-gray-500 mb-1">وقت الإجابة</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {selectedResult.timeTaken} <span className="text-xs font-normal">دقيقة</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                    <p className="text-xs text-gray-500 mb-1">الإجابات الصحيحة</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedResult.correctAnswers} <span className="text-gray-400 text-sm">/ {selectedResult.totalQuestions}</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                    <p className="text-xs text-gray-500 mb-1">اسم الدورة</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white truncate" title={selectedResult.course.title}>
                      {selectedResult.course.title}
                    </p>
                  </div>
                </div>

                {/* Answers Section */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaListAlt className="text-gray-400" /> تحليل الإجابات
                  </h4>
                  <div className="space-y-4">
                    {selectedResult.answers && selectedResult.answers.length > 0 ? (
                      selectedResult.answers.map((ans, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border ${ans.isCorrect ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10'}`}>
                          <div className="flex items-start gap-4">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${ans.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-gray-200 mb-2">
                                السؤال رقم {ans.questionIndex + 1}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                <span className={ans.isCorrect ? 'text-green-700' : 'text-red-700'}>
                                  إجابة الطالب: <strong>{ans.selectedAnswer + 1}</strong>
                                </span>
                                {!ans.isCorrect && (
                                  <span className="text-green-700">
                                    الإجابة الصحيحة: <strong>{ans.correctAnswer + 1}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="self-center">
                              {ans.isCorrect ? <FaCheckCircle className="text-green-500 text-xl" /> : <FaTimesCircle className="text-red-500 text-xl" />}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">لا توجد تفاصيل للإجابات متاحة.</p>
                    )}
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold transition-colors"
                >
                  إغلاق النافذة
                </button>
              </div>

            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ExamResultsDashboard;
