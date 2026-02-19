import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { getAllCourses } from '../../Redux/Slices/CourseSlice';
import { getAllSubjects } from '../../Redux/Slices/SubjectSlice';
import {
  FaSearch,
  FaFilter,
  FaBookOpen,
  FaUser,
  FaStar,
  FaPlay,
  FaEye,
  FaGraduationCap,
  FaClock,
  FaUsers,
  FaArrowRight,
  FaTimes
} from 'react-icons/fa';

export default function CoursesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, loading } = useSelector((state) => state.course);
  const { subjects } = useSelector((state) => state.subject);

  // Initialize filters 
  const [filters, setFilters] = useState({
    subject: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getAllCourses());
    dispatch(getAllSubjects());
  }, [dispatch]);


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      search: ''
    });
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description.toLowerCase().includes(filters.search.toLowerCase());

    const matchesSubject = !filters.subject || course.subject?._id === filters.subject;

    return matchesSearch && matchesSubject;
  });

  const getTotalLessons = (course) => {
    let total = 0;
    if (course.directLessons) {
      total += course.directLessons.length;
    }
    if (course.units) {
      course.units.forEach(unit => {
        if (unit.lessons) {
          total += unit.lessons.length;
        }
      });
    }
    return total;
  };

  const getTotalPrice = (course) => {
    let total = 0;
    if (course.directLessons) {
      course.directLessons.forEach(lesson => {
        total += lesson.price || 0;
      });
    }
    if (course.units) {
      course.units.forEach(unit => {
        total += unit.price || 0;
        if (unit.lessons) {
          unit.lessons.forEach(lesson => {
            total += lesson.price || 0;
          });
        }
      });
    }
    return total;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary via-primary-dark to-primary-darker text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                الكورسات المتاحة
              </h1>
              <p className="text-xl text-primary-light/80 max-w-3xl mx-auto">
                اكتشف مجموعة متنوعة من الكورسات التعليمية المصممة خصيصاً لمساعدتك في تحقيق أهدافك الأكاديمية
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="ابحث في الدورات..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FaFilter />
              <span>الفلاتر</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    التصنيف
                  </label>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">جميع التصنيف</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <FaTimes />
                    <span>مسح الفلاتر</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              تم العثور على <span className="font-semibold text-gray-900 dark:text-white">{filteredCourses.length}</span> دورة
            </p>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الدورات...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Course Image */}
                  <div className="h-48 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
                    {course.image && course.image.secure_url ? (
                      // Display actual course image
                      <img
                        src={`${import.meta.env.VITE_REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:4095'}/uploads/courses/${course.image.public_id}`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    {/* Fallback placeholder icon */}
                    <div className={`absolute inset-0 flex items-center justify-center ${course.image && course.image.secure_url ? 'hidden' : ''}`}>
                      <FaBookOpen className="text-6xl text-white opacity-80" />
                    </div>

                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    {course.stage?.name && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-white bg-opacity-90 text-gray-800 text-xs font-medium rounded-full">
                          {course.stage.name}
                        </span>
                      </div>
                    )}
                  </div>


                  {/* Course Content */}
                  <div className="p-6">
                    {/* Course Meta */}
                    <div className="space-y-3 mb-4">
                      {/* Instructor */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaUser className="text-gray-400" />
                        <span>{course.instructor?.name || 'غير محدد'}</span>
                        <FaStar className="text-primary" />
                        <span>{getTotalLessons(course)} درس متاح</span>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      {/* Course Description */}
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {course.description}
                      </p>





                      {/* Course Price */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {(course.price || 0) > 0 ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">سعر الكورس:</span>
                            <span className="text-lg font-bold text-primary">{course.price} جنيه</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">سعر الكورس:</span>
                            <span className="text-lg font-bold text-primary">مجاني ✓</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex-1 bg-accent hover:bg-accent/80 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"

                      >
                        <FaEye />
                        <span>عرض التفاصيل</span>
                      </Link>
                      {(course.price || 0) > 0 ? (
                        <Link
                          to={`/courses/${course._id}`}
                        className="flex-1 btn-primary hover:bg-primary-dark text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <FaGraduationCap />
                          <span>شراء الكورس</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/courses/${course._id}`}
                          className="flex-1 btn-primary hover:bg-primary-dark text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <FaPlay />
                          <span>ابدأ مجاناً</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد دورات متاحة
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                جرب تغيير الفلاتر أو البحث عن شيء آخر
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
