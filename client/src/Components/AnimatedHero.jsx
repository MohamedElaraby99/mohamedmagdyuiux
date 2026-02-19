import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlay, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { HERO, BRAND } from '../Constants/LayoutConfig';
import heroImage from '../assets/image.webp';
import creditCardImage from '../assets/image copy.webp';
import icon1 from '../assets/hero1.png';
import icon2 from '../assets/her3.png';
import icon3 from '../assets/hero2.png';

const AnimatedHero = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [showVideo, setShowVideo] = useState(false);

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

              <button
                className="hero-btn-secondary"
                onClick={() => setShowVideo(true)}
              >
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

                  <img
                src={creditCardImage}
                alt="Credit Card"
                className="hero-credit-card"
              />

              {/* Floating Credit Card */}
              <img
                src={icon1}
                alt="icon1"
                className="icon1"
              />

              <img
                src={icon2}
                alt="icon2"
                className="icon2"
              />

              <img
                src={icon3}
                alt="icon3"
                className="icon3"
              />

            </div>
          </div>
        </div>
      </section>

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