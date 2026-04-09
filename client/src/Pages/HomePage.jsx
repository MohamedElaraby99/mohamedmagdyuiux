import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import iconLine from "../assets/image copy 3.png";
import { getAllBlogs } from "../Redux/Slices/BlogSlice";
import { getFeaturedSubjects } from "../Redux/Slices/SubjectSlice";
import { getFeaturedCourses } from "../Redux/Slices/CourseSlice";
import { checkCourseAccess } from "../Redux/Slices/CourseAccessSlice";

import { generateImageUrl } from "../utils/fileUtils";
import AnimatedHero from "../Components/AnimatedHero";
import FeaturesSection from "../Components/FeaturesSection";
import TestimonialsSection from "../Components/TestimonialsSection";
import PromoBannerSection from "../Components/PromoBannerSection";
import DesignerProfileSection from "../Components/DesignerProfileSection";
import { FaBookOpen, FaArrowUp } from "react-icons/fa";

export default function HomePage() {
  const dispatch = useDispatch();
  const { featuredCourses, featuredLoading } = useSelector((state) => state.course);
  const courseAccessByid = useSelector((state) => state.courseAccess.byCourseId);

  const { isLoggedIn, data: userData } = useSelector((state) => state.auth);

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hero entrance animation state
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // Progressive loading - fetch data in sequence for better performance
    const loadData = async () => {
      // First, fetch essential data (subjects, courses, and stages)
      await Promise.all([
        dispatch(getFeaturedSubjects()),
        dispatch(getFeaturedCourses()),

      ]);

      // Then fetch blogs after a short delay for better perceived performance
      setTimeout(() => {
        dispatch(getAllBlogs({ page: 1, limit: 3 }));
      }, 500);

    };

    loadData();

    // Hero entrance animation
    const timer = setTimeout(() => {
      setHeroVisible(true);
      setTimeout(() => {
        setHeroLoaded(true);
      }, 300);
    }, 100);

    // Add scroll event listener
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setShowScrollTop(scrolled > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [dispatch]);

  // Check course access for each featured course when user is logged in
  useEffect(() => {
    if (isLoggedIn && userData && featuredCourses?.length > 0) {
      featuredCourses.slice(0, 6).forEach((course) => {
        if (course._id) dispatch(checkCourseAccess(course._id));
      });
    }
  }, [isLoggedIn, userData, featuredCourses, dispatch]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get Started Handler
  const onGetStarted = () => {
    // Navigate to signup page
    window.location.href = '/signup';
  };



  return (
    <Layout mainClassName="min-h-[100vh] bg-[#080E1E]">
      {/* Hero Section - Clean & Modern RTL */}
      <div className={`transition-all duration-1000 ease-out ${heroVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}>
        <AnimatedHero onGetStarted={onGetStarted} />
      </div>

      {/* Features Section */}
      <FeaturesSection />


      {/* Featured Courses Section */}
      {/* Featured Courses Section */}
      <section className={`py-20 bg-[#080E1E] transition-all duration-700 ease-out ${heroLoaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}
        dir="rtl"
        style={{ transitionDelay: '200ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className={`flex flex-col items-center justify-center mb-12 md:mb-16 transition-all duration-700 ease-out ${heroLoaded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '400ms' }}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              كورساتنا
            </h2>
            <img src={iconLine} alt="" className="w-32 md:w-48 h-auto object-contain opacity-90" />
          </div>

          {featuredLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400/40 border-t-cyan-400 mx-auto mb-4" />
              <p className="text-slate-400">جاري تحميل الكورسات المميزة...</p>
            </div>
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="flex flex-col gap-10 md:gap-12">
              {featuredCourses.slice(0, 6).map((course, index) => {
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
                  className={`group rounded-[28px] border border-[#1e293b] bg-[#0f172a] shadow-[0_24px_48px_rgba(0,0,0,0.35)] transition-all duration-500 ease-out hover:border-slate-600/80 ${heroLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                    }`}
                  style={{
                    transitionDelay: `${600 + (index * 100)}ms`
                  }}
                >
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-12 p-6 sm:p-8 lg:p-10">
                    {/* Content — على الديسكتوب يظهر يمين (RTL) */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 order-2 lg:order-2">
                      <div>
                        <p className="text-cyan-400 text-sm font-semibold mb-3 tracking-wide">
                          دبلومة 2026
                        </p>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-snug">
                          {course.title}
                        </h3>
                        {course.subtitle && (
                          <p className="text-slate-400 text-sm mb-4" dir="auto">
                            {course.subtitle}
                          </p>
                        )}
                        <p className="text-slate-400 leading-relaxed text-sm sm:text-base mb-8 md:mb-10">
                          {desc}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4 sm:gap-x-6 mb-8 md:mb-10 max-w-2xl">
                          {stats.map((s) => (
                            <div key={s.label} className="text-center sm:text-start">
                              <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                                {s.value}
                              </div>
                              <div className="text-xs sm:text-sm text-slate-500 mt-1.5">
                                {s.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-6 sm:gap-8 pt-2 sm:pt-0 items-end w-full">
                        <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-end">
                          {course.price > 0 ? (
                            <span dir="ltr" className="inline-flex items-baseline gap-2 tabular-nums">
                              <span>{course.price}</span>
                              <span className="font-bold">L.E</span>
                            </span>
                          ) : (
                            'مجاني'
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto sm:flex-wrap sm:justify-end">
                          {isLoggedIn && courseAccessByid[course._id]?.hasAccess ? (
                            <Link
                              to={`/courses/${course._id}`}
                              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-[0_0_24px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-colors duration-200 flex-1 sm:flex-initial min-w-[180px] text-center"
                            >
                              انت مشترك في الكورس واكمل ماشي
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

                    {/* صورة الكورس — فوق على الموبايل */}
                    <div className="w-full lg:w-[42%] xl:w-[40%] shrink-0 order-1 lg:order-1 flex items-center justify-center p-2 sm:p-3 lg:p-4">
                      <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:min-h-[280px] lg:h-full rounded-2xl overflow-hidden border border-slate-700/60 bg-[#0a0c10] rotate-[4deg] shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:rotate-[3deg]">
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
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📚</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                لا توجد كورسات متاحة حالياً
              </h3>
              <p className="text-slate-400">
                سيتم إضافة كورسات جديدة قريباً!
              </p>
            </div>
          )}

          {/* View All Courses Button */}
          {featuredCourses && featuredCourses.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-cyan-400 text-gray-900 font-bold text-sm sm:text-base shadow-[0_0_24px_rgba(34,211,238,0.25)] hover:bg-cyan-300 transition-colors duration-200 min-w-[180px] text-center"
              >
                عرض جميع الكورسات
              </Link>
            </div>
          )}
        </div>
      </section>

      

  
      <TestimonialsSection />

      <DesignerProfileSection />

      <PromoBannerSection />

      {/* Scroll to Top Button */}
      {
        showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 btn-primary text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
            aria-label="Scroll to top"
          >
            <FaArrowUp className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        )
      }
    </Layout >
  );
}
