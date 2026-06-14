import React, { useEffect, useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

interface SplashLoaderProps {
  onComplete: () => void;
}

export default function SplashLoader({ onComplete }: SplashLoaderProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show text after a tiny delay
    const contentTimer = setTimeout(() => setShowContent(true), 200);
    
    // Start exit transition
    const leaveTimer = setTimeout(() => setIsLeaving(true), 2400);

    // Call onComplete after transition finishes
    const doneTimer = setTimeout(() => {
      onComplete();
    }, 3400); // 2400ms delay + 1000ms fade transition

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-farm-green-dark selection:bg-farm-green selection:text-white transition-opacity duration-1000 ${
        isLeaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at center, #1E5E3A 0%, #0F2016 100%)",
      }}
    >
      <style jsx>{`
        @keyframes drawStem {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes growLeafRight {
          0% {
            transform: scale(0) rotate(-30deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.95;
          }
        }
        @keyframes growLeafLeft {
          0% {
            transform: scale(0) rotate(30deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.95;
          }
        }
        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(196, 164, 106, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(196, 164, 106, 0.8));
          }
        }
        .animate-stem {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStem 1.2s ease-out forwards;
        }
        .animate-leaf-right {
          transform-origin: 52px 28px;
          animation: growLeafRight 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards;
          opacity: 0;
        }
        .animate-leaf-left {
          transform-origin: 50px 42px;
          animation: growLeafLeft 1s cubic-bezier(0.34, 1.56, 0.64, 1) 1s forwards;
          opacity: 0;
        }
        .animate-text-group {
          animation: fadeInSlideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards;
          opacity: 0;
        }
        .animate-logo {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }
        .sprout-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @keyframes loadingBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      {showContent && (
        <div className="flex flex-col items-center text-center px-6">
          {/* Logo animation block */}
          <div className="sprout-container animate-logo mb-6">
            <svg
              className="w-28 h-28"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sprout stem */}
              <path
                d="M60 100 C 60 70, 58 45, 52 28"
                stroke="#C4A46A"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-stem"
              />

              {/* Right Leaf (Gold Accent) */}
              <path
                d="M52 28 C 68 25, 92 10, 94 -2 C 94 -2, 78 0, 56 22 Z"
                fill="#C4A46A"
                className="animate-leaf-right"
              />

              {/* Left Leaf (Green/Cream Contrast) */}
              <path
                d="M58 50 C 38 45, 12 35, 8 18 C 8 18, 24 22, 50 42 Z"
                fill="#FBF9F6"
                className="animate-leaf-left"
              />
            </svg>
          </div>

          {/* Text fade in */}
          <div className="animate-text-group">
            <h1 className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2`}>
              Farmstay <span className="text-farm-gold">Nusantara</span>
            </h1>
            <p className="text-xs sm:text-sm tracking-widest text-farm-cream/80 uppercase font-light max-w-xs sm:max-w-md mx-auto leading-relaxed">
              Gateway to Eco-Agritourism
            </p>
            
            {/* Subtle Progress Bar */}
            <div className="w-32 h-[2px] bg-white/10 mx-auto mt-8 rounded-full overflow-hidden">
              <div 
                className="h-full bg-farm-gold rounded-full transition-all duration-1000" 
                style={{
                  width: "100%",
                  animation: "loadingBar 2s ease-in-out forwards"
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
