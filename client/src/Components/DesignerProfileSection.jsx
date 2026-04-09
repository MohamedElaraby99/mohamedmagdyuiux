import React from 'react';
import profilePortrait from '../assets/image copy 15.png';
import profileBadge from '../assets/image copy 16.png';

const stats = [
  { value: '5K+', label: 'FOLLOWERS' },
  { value: '100+', label: 'VIDEO' },
  { value: '100+', label: 'PROJECT' },
];

const DesignerProfileSection = () => {
  return (
    <section
      className="py-16 md:py-24 bg-[#080E1E] border-t border-white/[0.06]"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14 lg:gap-16 xl:gap-20">
          {/* صورة أولاً في DOM: على الديسكتوب تظهر يمين، والنص يسار — على الموبايل الصورة فوق */}
          <div className="w-full md:flex-1 max-w-lg md:max-w-none shrink-0 order-1">
            <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] rounded-[24px] overflow-hidden border border-white/[0.08] bg-[#0a0c10] shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
              <img
                src={profilePortrait}
                alt="أحمد مجدي عبدالله"
                className="absolute inset-0 w-full h-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
              {/* بطاقة الاسم — صورة التصميم */}
              <div className="absolute bottom-4 left-[-6%] right-4 sm:right-auto z-10 max-w-[min(100%,320px)]">
                <img
                  src={profileBadge}
                  alt=""
                  className="w-full h-auto object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
                  loading="lazy"
                  decoding="async"
                  aria-hidden
                />
                <span className="sr-only">Ahmed Magdy, Product Designer</span>
              </div>
            </div>
          </div>

          <div className="w-full md:flex-1 flex flex-col justify-center text-right order-2 min-w-0">
            <h2 className="text-3xl sm:text-4xl md:text-[2.5rem] lg:text-5xl font-bold text-white mb-5 md:mb-6 leading-tight tracking-tight">
              أحمد مجدي عبدالله
            </h2>
            <p className="text-slate-200/95 text-base sm:text-lg leading-relaxed mb-10 md:mb-12 max-w-xl ms-auto">
              مصمم UI/UX مبدع، قادر على تحويل الأفكار إلى تجارب مستخدم رائعة بفضل خبرته
              الدقيقة واهتمامه بالتفاصيل... يقدم حلول مبتكرة ويشرح المفاهيم المعقدة ببساطة،
              مما يجعل التعلم ممتعاً وسهلاً.
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl ms-auto w-full">
              {stats.map((s) => (
                <div key={s.label} className="text-center sm:text-right">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 tabular-nums tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-white/80 font-semibold tracking-wider mt-1.5 uppercase">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignerProfileSection;
