import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaCompress, FaExpand, FaPlay, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import heroVisualLeft from '../assets/image copy 6.png';
import heroFloatMomentum from '../assets/image copy 7.png';
import heroFloatModule from '../assets/image copy 8.png';
import { HERO } from '../Constants/LayoutConfig';
import HeroStatsBar from './HeroStatsBar';

const AnimatedHero = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const el =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!el);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const el = videoContainerRef.current;
    const fs =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;
    if (!fs) {
      if (el?.requestFullscreen) el.requestFullscreen();
      else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el?.msRequestFullscreen) el.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setShowVideo(false)}
        >
          <div
            ref={videoContainerRef}
            className={`relative w-full max-w-4xl bg-black shadow-2xl border border-white/10 ${isFullscreen ? 'h-screen rounded-none' : 'aspect-video rounded-2xl'}`}
            style={isFullscreen ? { width: '100vw', maxWidth: '100vw' } : {}}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Buttons — top-right corner, forced LTR so RTL page doesn't flip them */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2" dir="ltr">
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white/80 hover:text-white bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-md transition-all duration-200"
                title={isFullscreen ? 'خروج من الشاشة الكاملة' : 'شاشة كاملة'}
              >
                {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
              </button>
              <button
                onClick={() => setShowVideo(false)}
                className="p-2 text-white/80 hover:text-white bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-md transition-all duration-200"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <iframe
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/wL0dk_zCgYs?autoplay=1"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedHero;