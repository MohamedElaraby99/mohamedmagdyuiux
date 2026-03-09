import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    // Track page view with TikTok Pixel if initialized
    if (window.ttq) {
      window.ttq.page();
    }
  }, [pathname]);
};

export default useScrollToTop; 