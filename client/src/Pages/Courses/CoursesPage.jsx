import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { getAllCourses } from '../../Redux/Slices/CourseSlice';
import { getAllSubjects } from '../../Redux/Slices/SubjectSlice';
import { checkCourseAccess } from '../../Redux/Slices/CourseAccessSlice';
import { generateImageUrl } from '../../utils/fileUtils';
import { FaSearch, FaFilter, FaBookOpen, FaTimes } from 'react-icons/fa';

export default function CoursesPage() {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.course);
  const { subjects } = useSelector((state) => state.subject);
  const courseAccessByid = useSelector((state) => state.courseAccess.byCourseId);
  const { isLoggedIn, data: userData } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    subject: '',
    search: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getAllCourses());
    dispatch(getAllSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn && userData && courses?.length > 0) {
      courses.forEach((course) => {
        if (course._id) dispatch(checkCourseAccess(course._id));
      });
    }
  }, [isLoggedIn, userData, courses, dispatch]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      search: '',
    });
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesSubject = !filters.subject || course.subject?._id === filters.subject;

    return matchesSearch && matchesSubject;
  });

  const courseCard = (course) => {
    const lessonCount = (course.directLessons?.length || 0) + 15;
    const hourCount = Math.round((course.directLessons?.length || 0) * 1.5 + 20);
    const videoCount = (course.directLessons?.length || 0) + 15;
    const taskCount = 70;
    const desc =
      course.description && course.description.length > 160
        ? `${course.description.slice(0, 160)}…`
        : course.description || '';

    const stats = [
      { value: `${lessonCount}+`, label: 'درس' },
      { value: `${hourCount}+`, label: 'ساعة' },
      { value: `${videoCount}+`, label: 'فيديو' },
      { value: `${taskCount}+`, label: 'تاسك' },
    ];

    return (
      <div
        key={course._id}
        className="group rounded-[28px] border border-[#1e293b] bg-[#0f172a] shadow-[0_24px_48px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300 hover:border-slate-600/80"
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-12 p-6 sm:p-8 lg:p-10">
          <div className="flex-1 flex flex-col justify-between min-w-0 order-2 lg:order-2">
            <div>
              <p className="text-cyan-400 text-sm font-semibold mb-3 tracking-wide">دبلومة 2026</p>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-snug">
                {course.title}
              </h3>
              {course.subtitle && (
                <p className="text-slate-400 text-sm mb-4" dir="auto">
                  {course.subtitle}
                </p>
              )}
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base mb-8 md:mb-10">{desc}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4 sm:gap-x-6 mb-8 md:mb-10 max-w-2xl">
                {stats.map((s) => (
                  <div key={s.label} className="text-center sm:text-start">
                    <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{s.value}</div>
                    <div className="text-xs sm:text-sm text-slate-500 mt-1.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 sm:gap-8 pt-2 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {course.price > 0 ? `${course.price} L.E` : 'مجاني'}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto sm:flex-wrap">
                {isLoggedIn && courseAccessByid[course._id]?.hasAccess ? (
                  <Link
                    to={`/courses/${course._id}`}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-[0_0_24px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-colors duration-200 flex-1 sm:flex-initial min-w-[180px] text-center"
                  >
                    كمل تعلم
                  </Link>
                ) : (
                  <Link
                    to={`/courses/${course._id}`}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-cyan-400 text-gray-900 font-bold text-sm sm:text-base shadow-[0_0_24px_rgba(34,211,238,0.25)] hover:bg-cyan-300 transition-colors duration-200 flex-1 sm:flex-initial min-w-[140px] text-center"
                  >
                    اشترك الآن
                  </Link>
                )}
                <Link
                  to={`/courses/${course._id}`}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/25 text-white font-semibold text-sm sm:text-base hover:bg-white/5 hover:border-white/35 transition-colors duration-200 flex-1 sm:flex-initial min-w-[140px] text-center"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[42%] xl:w-[40%] shrink-0 order-1 lg:order-1">
            <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:min-h-[280px] lg:h-full rounded-2xl overflow-hidden border border-slate-700/60 bg-[#0a0c10]">
              {course.image?.secure_url ? (
                <img
                  src={generateImageUrl(course.image.secure_url)}
                  alt={course.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <FaBookOpen className="text-6xl text-white/25" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout mainClassName="min-h-[100vh] bg-[#080E1E]">
      <div className="min-h-screen" dir="rtl">
        <div className="border-b border-white/[0.06] bg-[#080E1E] pt-10 pb-10 md:pt-14 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">الكورسات المتاحة</h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              اكتشف مجموعة من الكورسات المصممة لمساعدتك في تحقيق أهدافك في التصميم وتجربة المستخدم
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="mb-6">
            <div className="relative">
              <FaSearch
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] text-lg pointer-events-none z-[1]"
                aria-hidden
              />
              <input
                type="text"
                placeholder="ابحث في الدورات..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pr-12 pl-4 py-3.5 min-h-[52px] rounded-xl bg-white text-gray-900 placeholder:text-gray-500 border-0 shadow-sm ring-1 ring-black/[0.06] focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-[#080E1E] outline-none transition-shadow"
              />
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-slate-200 hover:bg-white/5 hover:border-white/15 transition-colors"
            >
              <FaFilter className="text-slate-400" />
              <span>الفلاتر</span>
            </button>
          </div>

          {showFilters && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0f172a] p-6 mb-8 shadow-inner">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">التصنيف</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#080E1E] text-white focus:ring-2 focus:ring-cyan-500/30 outline-none"
                  >
                    <option value="">جميع التصنيفات</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white transition-colors"
                  >
                    <FaTimes />
                    <span>مسح الفلاتر</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="mb-8 text-slate-400 text-sm">
            تم العثور على{' '}
            <span className="font-semibold text-white">{filteredCourses.length}</span> دورة
          </p>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400/30 border-t-cyan-400 mx-auto mb-4" />
              <p className="text-slate-400">جاري تحميل الدورات...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="flex flex-col gap-10 md:gap-12">{filteredCourses.map((course) => courseCard(course))}</div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-[#0f172a]/50">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-white mb-2">لا توجد دورات متاحة</h3>
              <p className="text-slate-400">جرّب تغيير الفلاتر أو البحث عن شيء آخر</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
