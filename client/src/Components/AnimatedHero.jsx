import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlay, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { HERO } from '../Constants/LayoutConfig';
import heroVisualLeft from '../assets/image copy 6.png';
import heroFloatMomentum from '../assets/image copy 7.png';
import heroFloatModule from '../assets/image copy 8.png';
import HeroStatsBar from './HeroStatsBar';

const AnimatedHero = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate('/courses');
    } else {
      onGetStarted();
    }
  };

  const buttonText = isLoggedIn ? 'ابدأ التعلم الآن' : (HERO.ctaButtonText || 'انضم الآن');

  return (
    <div className="hero-wrapper" dir="rtl">
      <section className="hero-section">
        <div className="hero-bg-decorations">
          <div className="hero-circle hero-circle-1" />
          <div className="hero-circle hero-circle-2" />
          <div className="hero-circle hero-circle-3" />
          <div className="hero-dots" />
        </div>

        <div className="hero-container">
          <div className={`hero-text-content ${isVisible ? 'hero-animate-in' : 'hero-animate-out'}`}>
            <span className="hero-eyebrow" dir="ltr">
              {HERO.eyebrowText || "2026 MASTERCLASS"}
            </span>
            <h1 className="hero-title hero-title-glow">
              إبدأ رحلتك الآن
            </h1>
            <p className="hero-description hero-description-wide">
              دبلومة متخصصة في تصميم واجهات وتجربة المستخدم (UI/UX)، تركز على تطوير مهاراتك في خلق
              تجارب رقمية مبتكرة تناسب المستخدم
            </p>

            <div className="hero-actions">
              <button type="button" onClick={handleButtonClick} className="hero-btn-primary hero-btn-gradient">
                <span>{buttonText}</span>
                {isLoggedIn ? <FaArrowLeft className="hero-btn-icon" /> : null}
              </button>
              <button
                type="button"
                className="hero-btn-secondary hero-btn-ghost-navy"
                onClick={() => setShowVideo(true)}
              >
                <FaPlay className="hero-play-icon hero-play-icon-compact" />
                <span>فيديو التفاصيل</span>
              </button>
            </div>
          </div>

          <div className={`hero-visual ${isVisible ? 'hero-visual-in' : 'hero-visual-out'}`}>
            <div className="hero-visual-shell">
              <div className="hero-visual-frame">
                <img
                  src={heroVisualLeft}
                  alt="Master UX/UI Design — Magdy Academy"
                  className="hero-visual-main-img"
                  decoding="async"
                />
                <div className="hero-visual-float-wrap hero-visual-float-wrap--momentum" aria-hidden>
                  <img
                    src={heroFloatMomentum}
                    alt=""
                    className="hero-visual-float-img"
                    decoding="async"
                  />
                </div>
                <div className="hero-visual-float-wrap hero-visual-float-wrap--module" aria-hidden>
                  <img
                    src={heroFloatModule}
                    alt=""
                    className="hero-visual-float-img"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <HeroStatsBar />

      {/* Video Modal */}
      {showVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-all duration-200"
            >
              <FaTimes size={20} />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/ODpB9-MCa5s?autoplay=1"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedHero;