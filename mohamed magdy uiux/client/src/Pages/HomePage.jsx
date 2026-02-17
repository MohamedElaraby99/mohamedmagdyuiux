import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import heroPng from "../assets/images/hero.png";
import { getAllBlogs } from "../Redux/Slices/BlogSlice";
import { getFeaturedSubjects } from "../Redux/Slices/SubjectSlice";
import { getFeaturedCourses } from "../Redux/Slices/CourseSlice";
import { getAllStages } from "../Redux/Slices/StageSlice";
import { generateImageUrl } from "../utils/fileUtils";
import AnimatedHero from "../Components/AnimatedHero";
import FeaturesSection from "../Components/FeaturesSection";
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

  // APK Download Handler
  const handleAPKDownload = () => {
    // Create a download link for the APK file
    const link = document.createElement('a');
    link.href = '/downloads/mrayman.apk'; // Update this path to your APK file location
    link.download = 'mrayman.apk';
    link.target = '_blank';

    // Fallback for mobile browsers
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
      // For Android devices, open the download directly
      window.open('/downloads/mrayman.apk', '_blank');
    } else {
      // For other devices, trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Show download started message
    if (window.toast) {
      window.toast.success('بدأ تحميل التطبيق...');
    }
  };

  // Google Play Store redirect (for future when app is published)
  const handlePlayStoreRedirect = () => {
    // Replace with your actual Google Play Store URL when published
    // Show a "Coming Soon" message instead of redirecting
    if (window.toast) {
      window.toast.info('قريباً على Google Play!');
    } else {
      alert('قريباً على Google Play!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    { icon: FaUsers, number: "10K+", label: "طالب مسجل", color: "text-purple-600" },
    { icon: FaGraduationCap, number: "100+", label: "مادة متاحة", color: "text-purple-600" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-yellow-600" },
    { icon: FaAward, number: "50+", label: "مدرس خبير", color: "text-purple-600" }
  ];

  const features = [
    {
      icon: FaRocket,
      title: "تعلم بوتيرتك الخاصة",
      description: "جداول تعلم مرنة تناسب نمط حياتك والتزاماتك.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: FaLightbulb,
      title: "دورات بقيادة الخبراء",
      description: "تعلم من المحترفين في المجال مع سنوات من الخبرة العملية.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: FaShieldAlt,
      title: "التعلم المعتمد",
      description: "احصل على شهادات معترف بها من أفضل الشركات في العالم.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: FaGlobe,
      title: "المجتمع العالمي",
      description: "تواصل مع المتعلمين من جميع أنحاء العالم وشارك الخبرات.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  const categories = [
    { icon: FaCode, name: "البرمجة", count: "150+ دورة", color: "bg-purple-500" },
    { icon: FaPalette, name: "التصميم", count: "120+ دورة", color: "bg-purple-500" },
    { icon: FaChartLine, name: "الأعمال", count: "200+ دورة", color: "bg-purple-500" },
    { icon: FaBookOpen, name: "التسويق", count: "180+ دورة", color: "bg-purple-500" }
  ];

  return (
    <Layout>
      {/* Hero Section - Clean & Modern RTL */}
      <div className={`transition-all duration-1000 ease-out ${heroVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}>
        <AnimatedHero onGetStarted={onGetStarted} />
      </div>

      {/* Featured Courses Section */}
      <section className={`py-20 bg-white dark:bg-gray-800 transition-all duration-700 ease-out ${heroLoaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}
        dir="rtl"
        style={{ transitionDelay: '200ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${heroLoaded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '400ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              كورساتنا المتاحة للعام 2025/2026
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف مجموعة واسعة من الكورسات التعليمية المميزة
            </p>
          </div>

          {featuredLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل الكورسات المميزة...</p>
            </div>
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCourses.slice(0, 6).map((course, index) => (
                <div
                  key={course._id}
                  className={`relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 ease-out group h-[50vh] ${heroLoaded
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
                    }`}
                  style={{
                    transitionDelay: `${600 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  {/* Full Background Image */}
                  <div className="absolute inset-0">
                    {course.image?.secure_url ? (
                      <img
                        src={generateImageUrl(course.image.secure_url)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}

                    {/* Fallback gradient for missing/broken images */}
                    <div className={`w-full h-full bg-gradient-to-br from-primary via-purple-600 to-primary-dark ${course.image?.secure_url ? 'hidden' : 'flex'} items-center justify-center`}>
                      <FaBookOpen className="text-8xl text-white opacity-40" />
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-500"></div>

                  {/* Stage Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold rounded-full shadow-lg border border-white/20">
                      {course.stage?.name || 'غير محدد'}
                    </span>
                  </div>

                  <div className="absolute top-4 left-4 z-20">
                    {(course.price || 0) > 0 ? (
                      <span className="px-3 py-1.5 bg-primary/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg border border-primary/50">{course.price} جنيه</span>
                    ) : (
                      <span className="px-3 py-1.5 bg-primary/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg border border-primary/50">مجاني ✓</span>
                    )}
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    {/* Course Meta Info */}
                    <div className="mb-3 space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <div className="flex items-center gap-1.5">
                          <FaUser className="w-3 h-3" />
                          <span className="font-medium">{course.instructor?.name || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaPlay className="w-3 h-3" />
                          <span className="font-medium">
                            {(course.directLessons?.length || 0) +
                              (course.units?.reduce((total, unit) => total + (unit.lessons?.length || 0), 0) || 0)} درس
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight drop-shadow-lg">
                      {course.title}
                    </h3>

                    {/* Subject */}
                    <p className="text-white/80 text-sm mb-4 font-semibold tracking-wide">
                      {course.description.slice(0, 80)}...
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex-1 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-center py-3.5 px-5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-white/30 hover:border-white/50 hover:scale-105 shadow-lg"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>شوف التفاصيل</span>
                      </Link>
                      <Link
                        to="/courses"
                        className="p-3.5 bg-primary/90 backdrop-blur-md hover:bg-primary text-white rounded-xl transition-all duration-300 flex items-center justify-center border border-primary/50 hover:border-primary-light hover:scale-105 shadow-lg"
                      >
                        <FaArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Hover Effect Indicator */}
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <div className="w-3 h-3 bg-primary-light rounded-full animate-pulse shadow-lg"></div>
                  </div>

                  {/* Bottom gradient for better text readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-5"></div>
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

      {/* Features Section */}
      <FeaturesSection />

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
