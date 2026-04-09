import React from 'react';
import { BRAND } from '../Constants/LayoutConfig';
import iconInstructor from '../assets/image copy 11.png';
import iconPractical from '../assets/image copy 12.png';
import iconPortfolio from '../assets/image copy 13.png';
import iconFollowup from '../assets/image copy 14.png';

const features = [
  {
    key: 'practical',
    title: 'تعليم عملي',
    description: 'الكورسات تركز على مهارات حقيقية يمكن تطبيقها في سوق العمل.',
    src: iconPractical,
    alt: 'تعليم عملي',
  },
  {
    key: 'instructor',
    title: 'مدرب محترف',
    description:
      'إنستركتور ذو خبرة كبيرة في التدريس، ويعمل في فريق أكبر منصة للتعلم الرقمي في مصر.',
    src: iconInstructor,
    alt: 'مدرب محترف',
  },
  {
    key: 'portfolio',
    title: 'بناء بورتفوليو قوي',
    description: 'تقدر تبني بورتفوليو قوي يوضح مهاراتك وقدراتك الإبداعية.',
    src: iconPortfolio,
    alt: 'بناء بورتفوليو',
    visualLarge: true,
  },
  {
    key: 'followup',
    title: 'متابعة مستمرة',
    description:
      'متابعة مع الطلاب بشكل شخصي على مدار الرحلة وتقييم مستواهم باستمرار.',
    src: iconFollowup,
    alt: 'متابعة مستمرة',
  },
];

const FeaturesSection = () => {
  const brandName = BRAND.teacherName || 'Magdy Academy';

  return (
    <section className="features-why-section py-16 md:py-24 bg-[#080E1E] transition-colors duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold leading-snug text-white mb-4 md:mb-5">
            <span className="text-white">ليه </span>
            <span className="text-[#A5A6FF]">{brandName}</span>
            <span className="text-white"> ؟</span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed font-normal">
            &ldquo;بتعلمك التفكير الإبداعي في التصميم وتوازن العناصر البصرية مع الفكرة، لتصميم تجربة
            مستخدم مميزة.&rdquo;
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {features.map((item) => (
            <article
              key={item.key}
              className="features-why-card group flex flex-row gap-4 sm:gap-5 items-start p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/[0.12] hover:bg-white/[0.05] transition-colors duration-300"
            >
              <div className="flex-1 min-w-0 text-right space-y-2.5">
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-sm sm:text-[0.95rem] text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div
                className={`shrink-0 flex items-center justify-center ${
                  item.visualLarge ? 'w-[104px] sm:w-[118px] min-h-[88px]' : 'w-[80px] h-[80px] sm:w-[88px] sm:h-[88px]'
                }`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className={
                    item.visualLarge
                      ? 'w-full h-auto max-h-[104px] sm:max-h-[118px] object-contain object-center p-1.5 select-none pointer-events-none'
                      : 'w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] object-contain object-center select-none pointer-events-none'
                  }
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
