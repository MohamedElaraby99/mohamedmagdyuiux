import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import { HERO, BRAND } from '../Constants/LayoutConfig';
import heroImage from '../assets/image.png';

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
              ابدأ مسيرتك في
              <br />
              <span className="hero-title-highlight">
                تصميم UX/UI
              </span>
            </h1>

            <p className="hero-description">
              اتعلم المهارات اللى هتفتحلك فرص كبيرة!
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

          {/* Left Side - Hero Image */}
          <div className={`hero-visual ${isVisible ? 'hero-visual-in' : 'hero-visual-out'}`}>
            <div className="hero-image-container">
              <img
                src={heroImage}
                alt="Master UX/UI Design"
                className="hero-main-image"
              />

        


            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnimatedHero;