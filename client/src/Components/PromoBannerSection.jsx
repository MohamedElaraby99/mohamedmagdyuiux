import React from 'react';
import { Link } from 'react-router-dom';

/**
 * بانر عرض خصم — تدرج أزرق → بنفسجي، زر أبيض
 */
export default function PromoBannerSection() {
  return (
    <section className="py-10 md:py-14 bg-[#080E1E]" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-[28px] px-6 py-10 sm:px-10 sm:py-12 md:py-14 text-center shadow-[0_24px_48px_rgba(59,130,246,0.25)]"
          style={{
            background: 'linear-gradient(115deg, #0ea5e9 0%, #6366f1 45%, #7c3aed 100%)',
          }}
        >
          <div className="relative z-10 flex flex-col items-center gap-5 md:gap-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight max-w-3xl">
              لفترة محدودة … خصم 30٪
            </h2>
            <p className="text-white/95 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl font-medium">
              خصم خاص 20٪ على الكورس بالإضافة إلى خصم 10٪ إضافي لطلاب حاسبات وذكاء إصطناعي وفنون تطبيقية أو
              جميلة.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-bold text-sky-600 shadow-lg transition-transform duration-200 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] mt-1"
            >
              احصل على الخصم الآن
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
