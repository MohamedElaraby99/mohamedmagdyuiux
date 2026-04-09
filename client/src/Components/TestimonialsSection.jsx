import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTestimonials } from '../Redux/Slices/TestimonialSlice';

/** ألوان دوائر الترقيم — بنفس ترتيب التصميم (يمين ← يسار) */
const BADGE_CLASS = [
  'bg-violet-500 text-white shadow-lg shadow-violet-500/35',
  'bg-cyan-400 text-gray-900 shadow-lg shadow-cyan-400/35',
  'bg-orange-300 text-gray-900 shadow-lg shadow-orange-300/40',
  'bg-emerald-400 text-gray-900 shadow-lg shadow-emerald-400/35',
];

const TestimonialsSection = () => {
  const dispatch = useDispatch();
  const { testimonials, loading } = useSelector((state) => state.testimonial);

  useEffect(() => {
    dispatch(getAllTestimonials({ isActive: true }));
  }, [dispatch]);

  const activeTestimonials = useMemo(
    () => testimonials.filter((t) => t.isActive),
    [testimonials]
  );

  return (
    <section className="py-16 md:py-24 bg-[#080E1E] transition-colors duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 md:mb-16 max-w-2xl mx-auto flex flex-col gap-4 md:gap-5">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            آراء الطلاب
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-snug">
            مشاركة بعض الطلاب بخصوص دبلومة الـ UI/UX
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-56">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400/30 border-t-cyan-400" />
          </div>
        ) : activeTestimonials.length > 0 ? (
          <div className="testimonials-timeline-wrap relative">
            {/* خط أفقي أزرق خلف البطاقات — يظهر بين الفجوات */}
            <div
              className="pointer-events-none absolute left-3 right-3 sm:left-6 sm:right-6 top-[calc(50%-2px)] h-[3px] z-0 rounded-full bg-gradient-to-l from-sky-500 via-cyan-400 to-sky-500 opacity-95 shadow-[0_0_16px_rgba(34,211,238,0.35)] hidden lg:block"
              aria-hidden
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 relative z-10">
              {activeTestimonials.map((testimonial, index) => {
                const n = String(index + 1).padStart(2, '0');
                const badgeClass = BADGE_CLASS[index % BADGE_CLASS.length];
                return (
                  <article
                    key={testimonial._id}
                    className="relative flex flex-col rounded-2xl border border-white/[0.08] bg-[#151b26] p-5 sm:p-6 min-h-[200px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-white text-right leading-tight pt-0.5 min-w-0">
                        {testimonial.name}
                      </h3>
                      <span
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badgeClass}`}
                      >
                        {n}
                      </span>
                    </div>
                    <p className="text-sm sm:text-[0.95rem] text-slate-300 leading-relaxed text-right flex-1">
                      {testimonial.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-14 text-base">لا توجد آراء حالياً</div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
