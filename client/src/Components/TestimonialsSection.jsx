import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTestimonials } from '../Redux/Slices/TestimonialSlice';

const BADGE_COLORS = [
  'bg-emerald-400 text-gray-900 shadow-emerald-400/40',
  'bg-cyan-400 text-gray-900 shadow-cyan-400/40',
  'bg-orange-300 text-gray-900 shadow-orange-300/40',
  'bg-violet-500 text-white shadow-violet-500/40',
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
    <section className="py-16 md:py-24 bg-[#080E1E]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <header className="text-center mb-12 md:mb-16 flex flex-col gap-3">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            آراء الطلاب
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            مشاركة بعض الطلاب بخصوص دبلومة الـ UI/UX
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-56">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400/30 border-t-cyan-400" />
          </div>
        ) : activeTestimonials.length > 0 ? (
          <div className="relative">

            {/* الخط الأفقي يمر عبر مراكز الدوائر — top-[32px] = padding(20px) + نصف ارتفاع الدائرة(h-10=40px)/2 */}
            <div
              aria-hidden
              className="hidden lg:block pointer-events-none absolute inset-x-0 top-[32px] h-[2px] z-0
                         bg-gradient-to-l from-sky-500 via-cyan-400 to-sky-500
                         shadow-[0_0_14px_rgba(34,211,238,0.4)]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
              {activeTestimonials.map((testimonial, index) => {
                const n = String(index + 1).padStart(2, '0');
                const badgeColor = BADGE_COLORS[index % BADGE_COLORS.length];
                return (
                  <article
                    key={testimonial._id}
                    className="flex flex-col rounded-2xl border border-white/[0.09] bg-[#111827] shadow-lg"
                  >
                    {/* رأس البطاقة: الاسم + الدائرة المرقّمة */}
                    <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
                      <h3 className="text-base sm:text-lg font-bold text-white leading-tight min-w-0 text-right">
                        {testimonial.name}
                      </h3>
                      <span
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-lg ${badgeColor}`}
                      >
                        {n}
                      </span>
                    </div>

                    {/* فاصل أزرق داخل البطاقة */}
                    <div className="mx-5 h-[2px] bg-gradient-to-l from-sky-500/60 via-cyan-400/60 to-sky-500/60 rounded-full" />

                    {/* النص */}
                    <p className="px-5 pt-4 pb-5 text-sm text-slate-300 leading-relaxed text-right flex-1">
                      "{testimonial.text}"
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 py-14 text-base">لا توجد آراء حالياً</p>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
