import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import heroPng from "../assets/images/hero.png";
import iconLine from "../assets/image copy 3.png";
import { getAllBlogs } from "../Redux/Slices/BlogSlice";
import { getFeaturedSubjects } from "../Redux/Slices/SubjectSlice";
import { getFeaturedCourses } from "../Redux/Slices/CourseSlice";
import { getAllStages } from "../Redux/Slices/StageSlice";
import { generateImageUrl } from "../utils/fileUtils";
import AnimatedHero from "../Components/AnimatedHero";
import FeaturesSection from "../Components/FeaturesSection";
import TestimonialsSection from "../Components/TestimonialsSection";
import { CONTACT, SOCIAL_MEDIA, PAYMENT } from "../Constants/LayoutConfig";
// Lazy load components
const FAQAccordion = lazy(() => import("../Components/FAQAccordion"));
const SubjectCard = lazy(() => import("../Components/SubjectCard"));
const InstructorSection = lazy(() => import("../Components/InstructorSection"));
const NewsletterSection = lazy(() => import("../Components/NewsletterSection"));

import {
  FaEye,
  FaHeart,
  FaCalendar,
  FaUser,
  FaArrowRight,
  FaPlay,
  FaStar,
  FaUsers,
  FaGraduationCap,
  FaRocket,
  FaLightbulb,
  FaShieldAlt,
  FaGlobe,
  FaCode,
  FaPalette,
  FaChartLine,
  FaBookOpen,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaQuestionCircle,
  FaArrowUp,
  FaWhatsapp,
  FaFacebook,
  FaYoutube,
  FaComments,
  FaTiktok,
  FaInstagram,
  FaArrowLeft,
  FaBook
} from "react-icons/fa";
import { placeholderImages } from "../utils/placeholderImages";
// Using a public URL for now - replace with your actual image URL
const fikraCharacter = "/fikra_character-removebg-preview.png";

export default function HomePage() {
  const dispatch = useDispatch();
  const { blogs } = useSelector((state) => state.blog);
  const { featuredSubjects } = useSelector((state) => state.subject);
  const { courses, featuredCourses, featuredLoading } = useSelector((state) => state.course);
  const { stages, loading: stagesLoading } = useSelector((state) => state.stage);

  const { role, isLoggedIn, data: userData } = useSelector((state) => state.auth);
  const userStageId = userData?.stage?._id || userData?.stage;
  const [isVisible, setIsVisible] = useState(false);
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
        dispatch(getAllStages())
      ]);

      // Then fetch blogs after a short delay for better perceived performance
      setTimeout(() => {
        dispatch(getAllBlogs({ page: 1, limit: 3 }));
      }, 500);
    };

    loadData();

    // Trigger animations
    setIsVisible(true);

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
    <Layout>
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
      <section className={`py-20 bg-[#FDFDF5] dark:bg-gray-900 transition-all duration-700 ease-out ${heroLoaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}
        dir="rtl"
        style={{ transitionDelay: '200ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className={`flex flex-col items-center justify-center mb-16 transition-all duration-700 ease-out ${heroLoaded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '400ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              كورساتنا
            </h2>
            <img src={iconLine} alt="underline" className="w-32 md:w-48 h-auto object-contain" />
          </div>

          {featuredLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل الكورسات المميزة...</p>
            </div>
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="flex flex-col gap-8">
              {featuredCourses.slice(0, 6).map((course, index) => (
                <div
                  key={course._id}
                  className={`bg-[#f9f9f9] dark:bg-gray-800 border-2 border-primary/10 rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all duration-500 ease-out flex flex-col lg:flex-row group ${heroLoaded
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
                    }`}
                  style={{
                    transitionDelay: `${600 + (index * 100)}ms`
                  }}
                >
                  {/* Image Side (Right in RTL) */}
                  <div className="relative w-full lg:w-[40%] h-64 lg:h-auto shrink-0 p-4">
                    <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-lg">
                      {course.image?.secure_url ? (
                        <img
                          src={generateImageUrl(course.image.secure_url)}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary via-purple-600 to-primary-dark flex items-center justify-center">
                          <FaBookOpen className="text-6xl text-white opacity-40" />
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                      {/* Title Translate Overlay (Optional aesthetic) */}
                      <div className="absolute bottom-4 right-4 text-white">
                        <h4 className="font-bold text-lg drop-shadow-md">UI/UX DESIGN</h4>
                        <p className="text-xs opacity-90">Crafting Digital Experiences</p>
                      </div>
                    </div>
                  </div>

                  {/* Content Side (Left in RTL) */}
                  <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                            {course.title}
                          </h3>
                        </div>
                        <p className="text-primary font-semibold text-lg" dir="ltr">
                          {course.subtitle || 'UI/UX Diploma'}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        {course.description.length > 150 ? course.description.slice(0, 150) + "..." : course.description}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 max-w-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                            <FaClock className="w-4 h-4" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap">
                            {(course.directLessons?.length || 0) * 1.5 + 20}+ ساعة
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                            <FaPlay className="w-4 h-4" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap">
                            +{(course.directLessons?.length || 0) + 15} فيديو
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                            <FaCheckCircle className="w-4 h-4" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap">
                            +70 تاسك
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                            <FaChartLine className="w-4 h-4" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap">
                            +5 مشاريع
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Price & Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-2xl lg:text-3xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
                        {course.price > 0 ? `${course.price} L.E` : 'مجاني'}
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Link
                          to={`/courses/${course._id}`}
                          className="px-6 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors w-full sm:w-auto text-center"
                        >
                          اعرف أكثر
                        </Link>
                        <button
                          onClick={() => window.location.href = '/signup'}
                          className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                        >
                          اشترك دلوقتي
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد كورسات متاحة حالياً
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                سيتم إضافة كورسات جديدة قريباً!
              </p>
            </div>
          )}

          {/* View All Courses Button */}
          {featuredCourses && featuredCourses.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 btn-primary text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>عرض جميع الكورسات</span>
                <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

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
