import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCourseById } from '../../Redux/Slices/CourseSlice';
import { checkCourseAccess } from '../../Redux/Slices/CourseAccessSlice';
import { generateImageUrl } from '../../utils/fileUtils';
import Layout from '../../Layout/Layout';
import {
  FaBookOpen, FaClock, FaVideo, FaTasks, FaChevronDown,
  FaChevronUp, FaLock, FaPlay, FaArrowRight, FaStar,
  FaUsers, FaCheckCircle, FaGraduationCap, FaAward,
  FaShieldAlt, FaBolt
} from 'react-icons/fa';
import iconLine from '../../assets/image copy 3.png';

export default function CourseInfoPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCourse, loading } = useSelector((s) => s.course);
  const { isLoggedIn, data: userData } = useSelector((s) => s.auth);
  const courseAccessState = useSelector((s) => s.courseAccess.byCourseId[id]);

  const [expandedUnits, setExpandedUnits] = useState(new Set([0]));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    dispatch(getCourseById(id));
    if (isLoggedIn && userData) dispatch(checkCourseAccess(id));
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [dispatch, id, isLoggedIn, userData]);

  const isSubscribed = isLoggedIn && courseAccessState?.hasAccess;

  if (loading || !currentCourse) {
    return (
      <Layout mainClassName="min-h-screen bg-[#080E1E]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-cyan-400/30 border-t-cyan-400 mx-auto mb-4" />
            <p className="text-slate-400">جاري تحميل الكورس...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const lessonCount = (currentCourse.directLessons?.length || 0) + 15;
  const hourCount = Math.round((currentCourse.directLessons?.length || 0) * 1.5 + 20);
  const videoCount = (currentCourse.directLessons?.length || 0) + 15;
  const taskCount = 70;

  const totalUnitsLessons = (currentCourse.units || []).reduce(
    (acc, u) => acc + (u.lessons?.length || 0), 0
  );
  const totalLessons = totalUnitsLessons + (currentCourse.directLessons?.length || 0);

  const stats = [
    { icon: <FaBookOpen />, value: `${lessonCount}+`, label: 'درس' },
    { icon: <FaClock />, value: `${hourCount}+`, label: 'ساعة محتوى' },
    { icon: <FaVideo />, value: `${videoCount}+`, label: 'فيديو' },
    { icon: <FaTasks />, value: `${taskCount}+`, label: 'تاسك عملي' },
  ];

  const highlights = [
    { icon: <FaCheckCircle />, text: 'تعلم أساسيات UX/UI من الصفر' },
    { icon: <FaCheckCircle />, text: 'مشاريع عملية حقيقية' },
    { icon: <FaCheckCircle />, text: 'شهادة معتمدة بعد الإنهاء' },
    { icon: <FaCheckCircle />, text: 'وصول مدى الحياة للمحتوى' },
    { icon: <FaCheckCircle />, text: 'دعم مباشر من المدرب' },
    { icon: <FaCheckCircle />, text: 'تحديثات مستمرة للكورس' },
  ];

  const toggleUnit = (i) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <Layout mainClassName="min-h-screen bg-[#080E1E]">
      <div dir="rtl" className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0a1628] to-[#080E1E] pt-10 pb-16 md:pt-14 md:pb-20">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-cyan-400 text-sm font-semibold mb-3 tracking-wide">دبلومة 2026</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {currentCourse.title}
                </h1>
                {currentCourse.subtitle && (
                  <p className="text-slate-300 text-base mb-4">{currentCourse.subtitle}</p>
                )}
                <p className="text-slate-400 leading-relaxed text-sm sm:text-base mb-8 max-w-2xl">
                  {currentCourse.description}
                </p>

                {/* Rating strip */}
                <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
                  <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                    <span className="text-white mr-1">4.9</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <FaUsers className="text-cyan-400" />
                    +1200 طالب
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <FaAward className="text-cyan-400" />
                    شهادة معتمدة
                  </span>
                </div>

                {/* Price + Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-4xl font-bold text-white">
                    {currentCourse.price > 0 ? (
                      <span dir="ltr">{currentCourse.price} <span className="text-2xl">L.E</span></span>
                    ) : 'مجاني'}
                  </div>
                  {isSubscribed ? (
                    <button
                      onClick={() => navigate(`/courses/${id}`)}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-500 text-white font-bold text-sm sm:text-base hover:bg-emerald-400 transition-colors shadow-[0_0_24px_rgba(16,185,129,0.3)]"
                    >
                      <FaPlay className="text-xs" />
                      كمل تعلم
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/courses/${id}`)}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-cyan-400 text-gray-900 font-bold text-sm sm:text-base hover:bg-cyan-300 transition-colors shadow-[0_0_24px_rgba(34,211,238,0.3)]"
                    >
                      <FaBolt className="text-xs" />
                      اشترك الآن
                    </button>
                  )}
                </div>
              </div>

              {/* Image */}
              <div className="w-full lg:w-[44%] shrink-0 flex items-center justify-center">
                <div className="relative w-full max-w-[460px]">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 bg-[#0a0c10] rotate-[3deg] shadow-[0_24px_60px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:rotate-[1.5deg] aspect-[4/3]">
                    {currentCourse.image?.secure_url ? (
                      <img
                        src={generateImageUrl(currentCourse.image.secure_url)}
                        alt={currentCourse.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <FaBookOpen className="text-7xl text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-4 -right-4 bg-cyan-400 text-gray-900 rounded-2xl px-4 py-2 font-bold text-sm shadow-lg">
                    دبلومة 2026
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="bg-[#0f172a] border-y border-[#1e293b]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <div className="text-cyan-400 text-xl">{s.icon}</div>
                  <div className="text-3xl font-bold text-white tabular-nums">{s.value}</div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Main Content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

            {/* ── Left Column ── */}
            <div className="flex-1 min-w-0 space-y-12">

              {/* What you'll learn */}
              <section>
                <div className="flex flex-col items-start mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">ماذا ستتعلم؟</h2>
                  <img src={iconLine} alt="" className="w-24 h-auto opacity-80" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                      <span className="text-emerald-400 mt-0.5 text-base flex-shrink-0">{h.icon}</span>
                      <span className="text-slate-300 text-sm leading-relaxed">{h.text}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Curriculum */}
              {(currentCourse.units?.length > 0 || currentCourse.directLessons?.length > 0) && (
                <section>
                  <div className="flex flex-col items-start mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">محتوى الكورس</h2>
                    <img src={iconLine} alt="" className="w-24 h-auto opacity-80" />
                    <p className="text-slate-500 text-sm mt-2">
                      {currentCourse.units?.length || 0} وحدة · {totalLessons} درس
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Units */}
                    {(currentCourse.units || []).map((unit, i) => (
                      <div key={unit._id || i} className="rounded-xl border border-[#1e293b] overflow-hidden">
                        <button
                          onClick={() => toggleUnit(i)}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-[#0f172a] hover:bg-[#1a2744] transition-colors text-right"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-cyan-400 text-xs font-bold bg-cyan-400/10 px-2.5 py-1 rounded-full shrink-0">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="text-white font-semibold text-sm truncate">{unit.title}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-slate-500 text-xs">{unit.lessons?.length || 0} درس</span>
                            {expandedUnits.has(i)
                              ? <FaChevronUp className="text-slate-500 text-xs" />
                              : <FaChevronDown className="text-slate-500 text-xs" />
                            }
                          </div>
                        </button>

                        {expandedUnits.has(i) && (
                          <div className="divide-y divide-[#1e293b]">
                            {(unit.lessons || []).map((lesson, li) => (
                              <div key={lesson._id || li} className="flex items-center gap-3 px-5 py-3 bg-[#080E1E]">
                                <FaLock className="text-slate-600 text-xs flex-shrink-0" />
                                <span className="text-slate-400 text-sm flex-1">{lesson.title}</span>
                                {lesson.isFree && (
                                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">مجاني</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Direct lessons */}
                    {currentCourse.directLessons?.length > 0 && (
                      <div className="rounded-xl border border-[#1e293b] overflow-hidden">
                        <div className="px-5 py-4 bg-[#0f172a] flex items-center gap-3">
                          <span className="text-cyan-400 text-xs font-bold bg-cyan-400/10 px-2.5 py-1 rounded-full">
                            دروس
                          </span>
                          <span className="text-white font-semibold text-sm">دروس إضافية</span>
                          <span className="text-slate-500 text-xs mr-auto">{currentCourse.directLessons.length} درس</span>
                        </div>
                        <div className="divide-y divide-[#1e293b]">
                          {currentCourse.directLessons.map((lesson, li) => (
                            <div key={lesson._id || li} className="flex items-center gap-3 px-5 py-3 bg-[#080E1E]">
                              <FaLock className="text-slate-600 text-xs flex-shrink-0" />
                              <span className="text-slate-400 text-sm flex-1">{lesson.title}</span>
                              {lesson.isFree && (
                                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">مجاني</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Instructor */}
              {currentCourse.instructor && typeof currentCourse.instructor === 'object' && (
                <section>
                  <div className="flex flex-col items-start mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">المدرب</h2>
                    <img src={iconLine} alt="" className="w-24 h-auto opacity-80" />
                  </div>
                  <div className="flex items-start gap-5 p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
                    <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden border-2 border-cyan-400/30"
                      style={{ background: 'linear-gradient(135deg,#0891b2,#6C2BD9)' }}>
                      {currentCourse.instructor.profileImage?.secure_url ? (
                        <img
                          src={generateImageUrl(currentCourse.instructor.profileImage.secure_url)}
                          alt={currentCourse.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                          {(currentCourse.instructor.name || 'م').charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg mb-0.5">{currentCourse.instructor.name}</h3>
                      {currentCourse.instructor.specialization && (
                        <p className="text-cyan-400 text-sm mb-3">{currentCourse.instructor.specialization}</p>
                      )}
                      {currentCourse.instructor.bio && (
                        <p className="text-slate-400 text-sm leading-relaxed">{currentCourse.instructor.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
                        {currentCourse.instructor.totalStudents > 0 && (
                          <span className="flex items-center gap-1.5">
                            <FaUsers className="text-cyan-400" />
                            {currentCourse.instructor.totalStudents.toLocaleString()} طالب
                          </span>
                        )}
                        {currentCourse.instructor.experience > 0 && (
                          <span className="flex items-center gap-1.5">
                            <FaAward className="text-cyan-400" />
                            {currentCourse.instructor.experience} سنوات خبرة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* ── Sticky Sidebar ── */}
            <aside className="lg:w-[340px] shrink-0">
              <div className="sticky top-6 rounded-2xl border border-[#1e293b] bg-[#0f172a] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                {/* Preview image */}
                <div className="relative aspect-video bg-[#080E1E]">
                  {currentCourse.image?.secure_url ? (
                    <img
                      src={generateImageUrl(currentCourse.image.secure_url)}
                      alt={currentCourse.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaBookOpen className="text-5xl text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <FaPlay className="text-white text-lg mr-[-2px]" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Price */}
                  <div className="text-4xl font-bold text-white mb-5">
                    {currentCourse.price > 0
                      ? <span dir="ltr">{currentCourse.price} <span className="text-2xl font-bold">L.E</span></span>
                      : <span className="text-emerald-400">مجاني</span>
                    }
                  </div>

                  {/* CTA */}
                  {isSubscribed ? (
                    <button
                      onClick={() => navigate(`/courses/${id}`)}
                      className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-400 transition-colors mb-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    >
                      <FaPlay className="text-sm" />
                      كمل تعلم
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/courses/${id}`)}
                      className="w-full py-3.5 rounded-xl bg-cyan-400 text-gray-900 font-bold text-base hover:bg-cyan-300 transition-colors mb-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                    >
                      <FaBolt className="text-sm" />
                      اشترك الآن
                    </button>
                  )}

                  <Link
                    to="/courses"
                    className="w-full py-3 rounded-xl border border-white/15 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaArrowRight className="text-xs" />
                    العودة للكورسات
                  </Link>

                  {/* Included */}
                  <div className="mt-6 space-y-3">
                    <p className="text-white font-semibold text-sm">يشمل الكورس:</p>
                    {[
                      { icon: <FaVideo className="text-cyan-400" />, text: `${videoCount}+ فيديو تعليمي` },
                      { icon: <FaClock className="text-cyan-400" />, text: `${hourCount}+ ساعة محتوى` },
                      { icon: <FaTasks className="text-cyan-400" />, text: `${taskCount}+ تاسك عملي` },
                      { icon: <FaGraduationCap className="text-cyan-400" />, text: 'شهادة إتمام الكورس' },
                      { icon: <FaShieldAlt className="text-cyan-400" />, text: 'وصول مدى الحياة' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                        <span className="text-sm flex-shrink-0">{item.icon}</span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </Layout>
  );
}
