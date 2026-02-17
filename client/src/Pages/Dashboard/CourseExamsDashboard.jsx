import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';
import Layout from '../../Layout/Layout';
import {
    FaBook,
    FaChalkboardTeacher,
    FaClipboardList,
    FaClipboardCheck,
    FaDumbbell,
    FaUsers,
    FaUser,
    FaChevronRight,
    FaChevronDown,
    FaArrowLeft,
    FaSearch,
    FaFilter,
    FaEye,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaPercentage,
    FaChartBar,
    FaCalendarAlt,
    FaLayerGroup,
    FaTimes,
    FaInfoCircle,
} from 'react-icons/fa';

const CourseExamsDashboard = () => {
    // State for navigation
    const [currentView, setCurrentView] = useState('courses'); // courses, lessons, exams, results
    const [breadcrumb, setBreadcrumb] = useState([{ label: 'الكورسات', view: 'courses' }]);

    // Data state
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [examResults, setExamResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [examTypeFilter, setExamTypeFilter] = useState('all'); // all, exam, training
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Fetch all courses
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/courses/admin/all');
            if (response.data.success) {
                // Access the courses array correctly - it can be response.data.data.courses or response.data.data
                const coursesData = response.data.data.courses || response.data.data || [];
                setCourses(coursesData);
            }
        } catch (error) {
            toast.error('فشل في جلب الكورسات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Extract lessons from course
    const extractLessons = (course) => {
        const allLessons = [];

        // Add direct lessons
        if (course.directLessons) {
            course.directLessons.forEach(lesson => {
                allLessons.push({
                    ...lesson,
                    type: 'direct',
                    unitId: null,
                    unitTitle: null,
                });
            });
        }

        // Add lessons from units
        if (course.units) {
            course.units.forEach(unit => {
                if (unit.lessons) {
                    unit.lessons.forEach(lesson => {
                        allLessons.push({
                            ...lesson,
                            type: 'unit',
                            unitId: unit._id,
                            unitTitle: unit.title,
                        });
                    });
                }
            });
        }

        return allLessons;
    };

    // Extract exams and trainings from lesson
    const extractExams = (lesson) => {
        const allExams = [];

        // Add exams (final exams)
        if (lesson.exams) {
            lesson.exams.forEach((exam, index) => {
                allExams.push({
                    ...exam,
                    type: 'exam',
                    displayType: 'امتحان نهائي',
                    index,
                    attemptCount: exam.userAttempts?.length || 0,
                });
            });
        }

        // Add trainings
        if (lesson.trainings) {
            lesson.trainings.forEach((training, index) => {
                allExams.push({
                    ...training,
                    type: 'training',
                    displayType: 'تدريب',
                    index,
                    attemptCount: training.userAttempts?.length || 0,
                });
            });
        }

        // Add entry exam if exists
        if (lesson.entryExam && lesson.entryExam.enabled) {
            allExams.push({
                ...lesson.entryExam,
                _id: 'entryExam',
                type: 'entryExam',
                displayType: 'امتحان المدخل',
                index: 0,
                attemptCount: lesson.entryExam.userAttempts?.length || 0,
            });
        }

        return allExams;
    };

    // Handle course selection
    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
        const extractedLessons = extractLessons(course);
        setLessons(extractedLessons);
        setCurrentView('lessons');
        setBreadcrumb([
            { label: 'الكورسات', view: 'courses' },
            { label: course.title, view: 'lessons' },
        ]);
    };

    // Handle lesson selection
    const handleSelectLesson = (lesson) => {
        setSelectedLesson(lesson);
        const extractedExams = extractExams(lesson);
        setExams(extractedExams);
        setCurrentView('exams');
        setBreadcrumb([
            { label: 'الكورسات', view: 'courses' },
            { label: selectedCourse.title, view: 'lessons' },
            { label: lesson.title, view: 'exams' },
        ]);
    };

    // Handle exam selection - show student attempts
    const handleSelectExam = (exam) => {
        setSelectedExam(exam);
        // Get user attempts for this exam
        const attempts = exam.userAttempts || [];
        setExamResults(attempts);
        setCurrentView('results');
        setBreadcrumb([
            { label: 'الكورسات', view: 'courses' },
            { label: selectedCourse.title, view: 'lessons' },
            { label: selectedLesson.title, view: 'exams' },
            { label: exam.title || exam.displayType, view: 'results' },
        ]);
    };

    // Handle breadcrumb navigation
    const handleBreadcrumbClick = (item) => {
        if (item.view === 'courses') {
            setCurrentView('courses');
            setBreadcrumb([{ label: 'الكورسات', view: 'courses' }]);
            setSelectedCourse(null);
            setSelectedLesson(null);
            setSelectedExam(null);
        } else if (item.view === 'lessons') {
            setCurrentView('lessons');
            setBreadcrumb([
                { label: 'الكورسات', view: 'courses' },
                { label: selectedCourse.title, view: 'lessons' },
            ]);
            setSelectedLesson(null);
            setSelectedExam(null);
        } else if (item.view === 'exams') {
            setCurrentView('exams');
            setBreadcrumb([
                { label: 'الكورسات', view: 'courses' },
                { label: selectedCourse.title, view: 'lessons' },
                { label: selectedLesson.title, view: 'exams' },
            ]);
            setSelectedExam(null);
        }
    };

    // Handle student details view
    const handleViewStudentDetails = async (attempt) => {
        try {
            // Fetch user details
            const response = await axiosInstance.get(`/admin/users/${attempt.userId}`);
            if (response.data.success) {
                setSelectedStudent({
                    ...response.data.data,
                    attempt,
                });
                setShowDetailsModal(true);
            }
        } catch (error) {
            // Show modal with available data
            setSelectedStudent({
                _id: attempt.userId,
                fullName: 'غير متوفر',
                attempt,
            });
            setShowDetailsModal(true);
        }
    };

    // Filter functions
    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLessons = lessons.filter(lesson =>
        lesson.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredExams = exams.filter(exam => {
        const matchesSearch = (exam.title || exam.displayType)?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = examTypeFilter === 'all' ||
            (examTypeFilter === 'exam' && exam.type === 'exam') ||
            (examTypeFilter === 'training' && exam.type === 'training');
        return matchesSearch && matchesType;
    });

    // Format date helper
    const formatDate = (date) => {
        if (!date) return 'غير محدد';
        return new Date(date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get score color
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-green-500';
        return 'text-red-500';
    };

    // Render breadcrumb
    const renderBreadcrumb = () => (
        <div className="flex items-center gap-2 text-sm mb-6 flex-wrap bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
            {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                    <button
                        onClick={() => handleBreadcrumbClick(item)}
                        className={`hover:text-green-500 dark:hover:text-blue-400 transition-colors ${index === breadcrumb.length - 1 ? 'text-green-500 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        {item.label}
                    </button>
                    {index < breadcrumb.length - 1 && (
                        <FaChevronRight className="text-gray-400 dark:text-gray-500 text-xs" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    // Render search and filter bar
    const renderSearchBar = () => (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-green-500/20 dark:focus:ring-blue-500/20 transition-colors"
                />
            </div>

            {currentView === 'exams' && (
                <select
                    value={examTypeFilter}
                    onChange={(e) => setExamTypeFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-blue-500 transition-colors appearance-none cursor-pointer min-w-[150px]"
                >
                    <option value="all" className="bg-white dark:bg-gray-800">الكل</option>
                    <option value="exam" className="bg-white dark:bg-gray-800">الامتحانات</option>
                    <option value="training" className="bg-white dark:bg-gray-800">التدريبات</option>
                </select>
            )}
        </div>
    );

    // Render courses list
    const renderCourses = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
                <div className="col-span-full flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 dark:border-blue-500 border-t-transparent"></div>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500 dark:text-gray-400">
                    <FaBook className="text-6xl mx-auto mb-4 opacity-30" />
                    <p className="text-xl">لا توجد كورسات</p>
                </div>
            ) : (
                filteredCourses.map((course) => {
                    const lessonsCount = extractLessons(course).length;
                    const totalExams = extractLessons(course).reduce((acc, lesson) => {
                        return acc + extractExams(lesson).length;
                    }, 0);

                    return (
                        <div
                            key={course._id}
                            onClick={() => handleSelectCourse(course)}
                            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-green-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-green-500/10 dark:hover:shadow-blue-500/10 transition-all duration-300 shadow-sm"
                        >
                            {/* Course image */}
                            <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-green-500/20 to-green-600/20 dark:from-blue-500/20 dark:to-purple-500/20">
                                {course.image?.secure_url ? (
                                    <img
                                        src={course.image.secure_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FaBook className="text-4xl text-green-400/50 dark:text-blue-400/50" />
                                    </div>
                                )}
                            </div>

                            {/* Course info */}
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {course.title}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
                                <span className="flex items-center gap-1">
                                    <FaLayerGroup />
                                    <span>{lessonsCount} درس</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <FaClipboardList />
                                    <span>{totalExams} امتحان</span>
                                </span>
                            </div>

                            {/* Arrow indicator */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaChevronRight className="text-green-500 dark:text-blue-400" />
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );

    // Render lessons list
    const renderLessons = () => (
        <div className="space-y-4">
            {filteredLessons.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <FaChalkboardTeacher className="text-6xl mx-auto mb-4 opacity-30" />
                    <p className="text-xl">لا توجد دروس</p>
                </div>
            ) : (
                filteredLessons.map((lesson, index) => {
                    const lessonExams = extractExams(lesson);
                    const totalAttempts = lessonExams.reduce((acc, exam) => acc + (exam.userAttempts?.length || 0), 0);

                    return (
                        <div
                            key={lesson._id || index}
                            onClick={() => handleSelectLesson(lesson)}
                            className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-green-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-green-500/10 dark:hover:shadow-blue-500/10 transition-all duration-300 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{lesson.title}</h3>
                                            {lesson.unitTitle && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">الوحدة: {lesson.unitTitle}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 dark:bg-blue-500/20 text-green-600 dark:text-blue-400">
                                            <FaClipboardCheck />
                                            <span>{lessonExams.filter(e => e.type === 'exam').length} امتحان</span>
                                        </span>
                                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                                            <FaDumbbell />
                                            <span>{lessonExams.filter(e => e.type === 'training').length} تدريب</span>
                                        </span>
                                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                                            <FaUsers />
                                            <span>{totalAttempts} محاولة</span>
                                        </span>
                                    </div>
                                </div>

                                <FaChevronRight className="text-gray-400 dark:text-gray-500 group-hover:text-green-500 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );

    // Render exams list
    const renderExams = () => (
        <div className="space-y-4">
            {filteredExams.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <FaClipboardList className="text-6xl mx-auto mb-4 opacity-30" />
                    <p className="text-xl">لا توجد امتحانات أو تدريبات</p>
                </div>
            ) : (
                filteredExams.map((exam, index) => (
                    <div
                        key={exam._id || index}
                        onClick={() => handleSelectExam(exam)}
                        className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-green-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-green-500/10 dark:hover:shadow-blue-500/10 transition-all duration-300 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${exam.type === 'exam' ? 'bg-gradient-to-br from-green-500 to-green-600 dark:from-blue-500 dark:to-blue-600' :
                                        exam.type === 'training' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                            'bg-gradient-to-br from-purple-500 to-purple-600'
                                        }`}>
                                        {exam.type === 'exam' ? <FaClipboardCheck className="text-white text-xl" /> :
                                            exam.type === 'training' ? <FaDumbbell className="text-white text-xl" /> :
                                                <FaClipboardList className="text-white text-xl" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{exam.title || exam.displayType}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${exam.type === 'exam' ? 'bg-green-500/10 text-green-600 dark:bg-blue-500/20 dark:text-blue-400' :
                                            exam.type === 'training' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                                                'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                                            }`}>
                                            {exam.displayType}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <FaClipboardList />
                                        <span>{exam.questions?.length || 0} سؤال</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaClock />
                                        <span>{exam.timeLimit || 0} دقيقة</span>
                                    </span>
                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                                        <FaUsers />
                                        <span>{exam.attemptCount} طالب ممتحن</span>
                                    </span>
                                </div>
                            </div>

                            <FaChevronRight className="text-gray-400 dark:text-gray-500 group-hover:text-green-500 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    // Render exam results (student attempts)
    const renderResults = () => (
        <div className="space-y-6">
            {/* Exam summary card */}
            {selectedExam && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selectedExam.type === 'exam' ? 'bg-gradient-to-br from-green-500 to-green-600 dark:from-blue-500 dark:to-blue-600' :
                            selectedExam.type === 'training' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                'bg-gradient-to-br from-purple-500 to-purple-600'
                            }`}>
                            {selectedExam.type === 'exam' ? <FaClipboardCheck className="text-white text-2xl" /> :
                                selectedExam.type === 'training' ? <FaDumbbell className="text-white text-2xl" /> :
                                    <FaClipboardList className="text-white text-2xl" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedExam.title || selectedExam.displayType}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{selectedExam.description || 'لا يوجد وصف'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-green-500 dark:text-blue-400">{selectedExam.questions?.length || 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">سؤال</p>
                        </div>
                        <div className="bg-green-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-green-500 dark:text-green-400">{selectedExam.timeLimit || 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">دقيقة</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">{examResults.length}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">محاولة</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-purple-500 dark:text-purple-400">
                                {examResults.length > 0
                                    ? Math.round(examResults.reduce((acc, r) => {
                                        const correct = r.answers?.filter(a => a.isCorrect).length || r.score || 0;
                                        const total = r.totalQuestions || r.answers?.length || 1;
                                        return acc + (correct / total) * 100;
                                    }, 0) / examResults.length)
                                    : 0}%
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">متوسط الدرجات</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Students table */}
            {examResults.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <FaUsers className="text-6xl mx-auto mb-4 opacity-30" />
                    <p className="text-xl">لا يوجد طلاب ممتحنين</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <th className="text-right px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">#</th>
                                    <th className="text-right px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">الطالب</th>
                                    <th className="text-right px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">الدرجة</th>
                                    <th className="text-right px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">الإجابات</th>
                                    <th className="text-right px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">تاريخ الامتحان</th>
                                    <th className="text-right px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {examResults.map((attempt, index) => (
                                    <tr
                                        key={attempt._id || index}
                                        className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center">
                                                    <FaUser className="text-white" />
                                                </div>
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {attempt.user?.fullName || attempt.userId?.fullName || attempt.fullName || 'طالب'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const correctAnswers = attempt.answers?.filter(a => a.isCorrect).length || attempt.score || 0;
                                                const totalQuestions = attempt.totalQuestions || attempt.answers?.length || 1;
                                                const percentage = Math.round((correctAnswers / totalQuestions) * 100);
                                                return (
                                                    <span className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                                                        {percentage}%
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-1 text-green-500 dark:text-green-400">
                                                    <FaCheckCircle />
                                                    <span>{attempt.answers?.filter(a => a.isCorrect).length || 0}</span>
                                                </span>
                                                <span className="text-gray-400 dark:text-gray-500">/</span>
                                                <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
                                                    <FaTimesCircle />
                                                    <span>{attempt.answers?.filter(a => !a.isCorrect).length || 0}</span>
                                                </span>
                                                <span className="text-gray-400 dark:text-gray-500">من</span>
                                                <span className="text-gray-500 dark:text-gray-400">{attempt.totalQuestions || attempt.answers?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-gray-400 dark:text-gray-500" />
                                                <span>{formatDate(attempt.takenAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewStudentDetails(attempt);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition-colors"
                                            >
                                                <FaEye />
                                                <span>عرض التفاصيل</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    // Render student details modal
    const renderDetailsModal = () => {
        if (!showDetailsModal || !selectedStudent) return null;

        const attempt = selectedStudent.attempt;

        return (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-white/10 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaInfoCircle className="text-green-500 dark:text-blue-400" />
                            تفاصيل محاولة الطالب
                        </h2>
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <FaTimes className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {/* Student info */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <FaUser className="text-green-500 dark:text-blue-400" />
                                معلومات الطالب
                            </h3>
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                                <p className="text-gray-600 dark:text-gray-400">
                                    <span className="text-gray-500">معرف الطالب: </span>
                                    <span className="text-gray-900 dark:text-white">{attempt.userId?.toString() || 'غير متوفر'}</span>
                                </p>
                                {selectedStudent.fullName && selectedStudent.fullName !== 'غير متوفر' && (
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        <span className="text-gray-500">الاسم: </span>
                                        <span className="text-gray-900 dark:text-white">{selectedStudent.fullName}</span>
                                    </p>
                                )}
                                {selectedStudent.email && (
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        <span className="text-gray-500">البريد: </span>
                                        <span className="text-gray-900 dark:text-white">{selectedStudent.email}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Exam results summary */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <FaChartBar className="text-green-500 dark:text-green-400" />
                                ملخص النتائج
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-center">
                                    {(() => {
                                        const correctAnswers = attempt.answers?.filter(a => a.isCorrect).length || attempt.score || 0;
                                        const totalQuestions = attempt.totalQuestions || attempt.answers?.length || 1;
                                        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
                                        return (
                                            <p className={`text-3xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</p>
                                        );
                                    })()}
                                    <p className="text-sm text-gray-500 dark:text-gray-400">الدرجة</p>
                                </div>
                                <div className="bg-green-50 dark:bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-bold text-green-500 dark:text-green-400">
                                        {attempt.answers?.filter(a => a.isCorrect).length || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">إجابة صحيحة</p>
                                </div>
                                <div className="bg-red-50 dark:bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-bold text-red-500 dark:text-red-400">
                                        {attempt.answers?.filter(a => !a.isCorrect).length || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">إجابة خاطئة</p>
                                </div>
                                <div className="bg-green-50 dark:bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-bold text-green-500 dark:text-blue-400">{attempt.totalQuestions || attempt.answers?.length || 0}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الأسئلة</p>
                                </div>
                            </div>
                        </div>

                        {/* Answers details */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <FaClipboardList className="text-purple-400" />
                                تفاصيل الإجابات
                            </h3>
                            <div className="space-y-3">
                                {attempt.answers?.map((answer, idx) => {
                                    const question = selectedExam?.questions?.[answer.questionIndex];
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border ${answer.isCorrect
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-red-500/10 border-red-500/30'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                                    }`}>
                                                    {answer.isCorrect ? <FaCheckCircle className="text-white" /> : <FaTimesCircle className="text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-medium mb-2">
                                                        السؤال {answer.questionIndex + 1}: {question?.question || 'السؤال غير متوفر'}
                                                    </p>
                                                    <div className="text-sm">
                                                        <p className="text-gray-400">
                                                            <span className="text-gray-500">إجابة الطالب: </span>
                                                            <span className={answer.isCorrect ? 'text-green-400' : 'text-red-400'}>
                                                                {question?.options?.[answer.selectedAnswer] || `الخيار ${answer.selectedAnswer + 1}`}
                                                            </span>
                                                        </p>
                                                        {!answer.isCorrect && question && (
                                                            <p className="text-gray-400 mt-1">
                                                                <span className="text-gray-500">الإجابة الصحيحة: </span>
                                                                <span className="text-green-400">
                                                                    {question.options?.[question.correctAnswer] || `الخيار ${question.correctAnswer + 1}`}
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 md:px-8" dir="rtl">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                            <FaClipboardCheck className="text-green-500 dark:text-blue-400" />
                            إدارة الامتحانات والنتائج
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">استعرض الكورسات والدروس والامتحانات وشاهد نتائج الطلاب</p>
                    </div>

                    {/* Breadcrumb */}
                    {renderBreadcrumb()}

                    {/* Search bar */}
                    {renderSearchBar()}

                    {/* Content based on current view */}
                    {currentView === 'courses' && renderCourses()}
                    {currentView === 'lessons' && renderLessons()}
                    {currentView === 'exams' && renderExams()}
                    {currentView === 'results' && renderResults()}

                    {/* Student details modal */}
                    {renderDetailsModal()}
                </div>
            </div>
        </Layout>
    );
};

export default CourseExamsDashboard;
