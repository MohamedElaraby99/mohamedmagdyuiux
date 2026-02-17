import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import { HERO, BRAND } from '../Constants/LayoutConfig';

const AnimatedHero = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkDarkMode = () => {
      const htmlElement = document.documentElement;
      const isDark = htmlElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate('/courses');
    } else {
      onGetStarted();
    }
  };

  const buttonText = isLoggedIn ? 'ابدأ التعلم الآن' : (HERO.ctaButtonText || 'اشترك الآن');

  return (
    <div className="hero-wrapper" dir="rtl">
      {/* Hero Section */}
      <section className="hero-section">
        {/* Decorative background elements */}
        <div className="hero-bg-decorations">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
          <div className="hero-dots"></div>
        </div>

        <div className="hero-container">
          {/* Right Side - Text Content */}
          <div className={`hero-text-content ${isVisible ? 'hero-animate-in' : 'hero-animate-out'}`}>
            <h1 className="hero-title">
              {HERO.mainTitle || 'ابدأ مسيرتك في'}
              <br />
              <span className="hero-title-highlight">
                {HERO.subtitle || 'تصميم UX/UI'}
              </span>
            </h1>

            <p className="hero-description">
              {HERO.topText || 'اتعلم المهارات اللى هتفتحلك فرص كبيرة!'}
            </p>

            <div className="hero-actions">
              <button
                onClick={handleButtonClick}
                className="hero-btn-primary"
              >
                <span>{buttonText}</span>
                <FaArrowLeft className="hero-btn-icon" />
              </button>

              <button className="hero-btn-secondary">
                <FaPlay className="hero-play-icon" />
                <span>فيديو التفاصيل</span>
              </button>
            </div>
          </div>

          {/* Left Side - Mockup / Visual */}
          <div className={`hero-visual ${isVisible ? 'hero-visual-in' : 'hero-visual-out'}`}>
            <div className="hero-mockup-container">
              {/* Main mockup screen */}
              <div className="hero-mockup-screen">
                <div className="mockup-browser-bar">
                  <div className="mockup-dot mockup-dot-red"></div>
                  <div className="mockup-dot mockup-dot-yellow"></div>
                  <div className="mockup-dot mockup-dot-green"></div>
                </div>
                <div className="mockup-content">
                  <div className="mockup-sidebar">
                    <div className="mockup-sidebar-item active"></div>
                    <div className="mockup-sidebar-item"></div>
                    <div className="mockup-sidebar-item"></div>
                    <div className="mockup-sidebar-item"></div>
                  </div>
                  <div className="mockup-main">
                    <div className="mockup-heading"></div>
                    <div className="mockup-text-line"></div>
                    <div className="mockup-text-line short"></div>
                    <div className="mockup-grid">
                      <div className="mockup-card"></div>
                      <div className="mockup-card"></div>
                      <div className="mockup-card"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="hero-floating-card hero-float-1">
                <div className="floating-card-icon">✓</div>
                <div className="floating-card-text">
                  <div className="fc-title">UX Research</div>
                  <div className="fc-bar"><div className="fc-bar-fill" style={{ width: '85%' }}></div></div>
                </div>
              </div>

              <div className="hero-floating-card hero-float-2">
                <div className="floating-card-icon">✓</div>
                <div className="floating-card-text">
                  <div className="fc-title">UI Design</div>
                  <div className="fc-bar"><div className="fc-bar-fill" style={{ width: '72%' }}></div></div>
                </div>
              </div>

              <div className="hero-floating-badge hero-float-3">
                <span className="badge-number">300+</span>
                <span className="badge-label">طالب</span>
              </div>

              <div className="hero-floating-badge hero-float-4">
                <span className="badge-number">2+</span>
                <span className="badge-label">سنة خبرة</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnimatedHero;