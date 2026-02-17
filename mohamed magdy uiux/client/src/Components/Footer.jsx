import React from "react";
import { SOCIAL_MEDIA, FOOTER } from "../Constants/LayoutConfig";
import youtubeIcon from "../assets/youtube.png";
import tiktokIcon from "../assets/tiktok.png";
import whatsappIcon from "../assets/whatsapp.png";
import facebookIcon from "../assets/facebook.png";
import footerLogo from "../assets/logofooter.png";

export default function Footer() {
  return (
    <footer className="bg-primary py-10 px-4 sm:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 font-['Almarai']">
          تواصل معنا
        </h2>

        {/* Social Media Icons */}
        <div className="flex justify-center items-center gap-6 md:gap-8 mb-16 md:mb-20">
          <a
            href={SOCIAL_MEDIA.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-300"
          >
            <img src={whatsappIcon} alt="WhatsApp" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          </a>
          <a
            href={SOCIAL_MEDIA.facebook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-300"
          >
            <img src={facebookIcon} alt="Facebook" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          </a>
          <a
            href={SOCIAL_MEDIA.tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-300"
          >
            <img src={tiktokIcon} alt="TikTok" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          </a>
          <a
            href={SOCIAL_MEDIA.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-300"
          >
            <img src={youtubeIcon} alt="YouTube" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          </a>
        </div>

        {/* Bottom Section: Logo and Developer */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center px-4 md:px-0 gap-4 mt-8">
          <div className="flex justify-start">
            <img src={footerLogo} alt="Magdy Academy" className="h-12 md:h-16 object-contain" />
          </div>

          <a
            href={FOOTER.developer?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white text-sm font-['Almarai'] transition-colors duration-300"
          >
            Developed By {FOOTER.developer?.name}
          </a>
        </div>
      </div>
    </footer>
  );
}
