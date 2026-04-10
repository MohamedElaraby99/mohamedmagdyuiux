import React, { useEffect, useMemo } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const COLORS = ['#34d399', '#22d3ee', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185', '#38bdf8', '#4ade80'];

/**
 * Full-screen celebration after successful course purchase (wallet).
 */
const CoursePurchaseCelebration = ({ open, onClose, courseTitle }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => ({
        id: i,
        left: `${4 + Math.random() * 92}%`,
        delay: `${Math.random() * 1.1}s`,
        duration: `${2.6 + Math.random() * 2.2}s`,
        dx: (Math.random() - 0.5) * 200,
        color: COLORS[i % COLORS.length],
        w: 5 + Math.random() * 10,
        h: 5 + Math.random() * 14,
        rounded: Math.random() > 0.45,
      })),
    [open]
  );

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-purchase-celebration-title"
    >
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"
        aria-hidden
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {pieces.map((p) => (
          <span
            key={p.id}
            className="course-celebration-piece"
            style={{
              left: p.left,
              width: p.w,
              height: p.h,
              backgroundColor: p.color,
              borderRadius: p.rounded ? '9999px' : '2px',
              animationDelay: p.delay,
              animationDuration: p.duration,
              ['--dx']: `${p.dx}px`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md course-purchase-celebration-modal">
        <div
          className="relative rounded-3xl border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.25)] overflow-hidden text-center"
          style={{ background: 'linear-gradient(165deg, #0f172a 0%, #0c1222 50%, #0a1628 100%)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 z-20 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="إغلاق"
          >
            <FaTimes className="text-lg" />
          </button>

          <div className="pt-10 pb-2 px-6">
            <div className="relative mx-auto w-20 h-20 mb-5">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <FaCheckCircle className="text-white text-4xl drop-shadow-md" />
              </div>
            </div>

            <h2
              id="course-purchase-celebration-title"
              className="text-2xl sm:text-3xl font-bold text-white mb-2"
            >
              مبروك! 🎉
            </h2>
            <p className="text-emerald-400/95 font-semibold text-base sm:text-lg mb-1">
              اشتراك الكورس اتسجل بنجاح
            </p>
            {courseTitle && (
              <p className="text-slate-300 text-sm sm:text-base mt-3 mb-6 leading-relaxed line-clamp-2" dir="auto">
                {courseTitle}
              </p>
            )}
            {!courseTitle && <div className="mb-6" />}

            <p className="text-slate-500 text-sm mb-8">
              دلوقتي تقدر تفتح كل الدروس والمحتوى — بالتوفيق في رحلتك.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-[0_8px_32px_rgba(16,185,129,0.35)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              يلا نكمل التعلم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePurchaseCelebration;
