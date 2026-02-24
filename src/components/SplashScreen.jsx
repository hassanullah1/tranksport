// components/SplashScreen.jsx
import React, { useEffect, useState } from "react";

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "Getting your deliveries ready...",
    "Loading amazing data...",
    "Preparing your dashboard...",
    "Almost there...",
    "Welcome back! ✨",
  ];

  useEffect(() => {
    // Rotate messages every 1.2 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1200);

    // Start fade-out after 3.5s (total 4s including fade)
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 500);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearInterval(messageInterval);
    };
  }, [onFinish, messages.length]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-sky-300 to-sky-100 transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Floating clouds background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 left-10 h-32 w-64 rounded-full bg-white/40 blur-3xl animate-float-slow"></div>
        <div className="absolute top-20 right-20 h-40 w-80 rounded-full bg-white/30 blur-3xl animate-float-medium"></div>
        <div className="absolute bottom-10 left-1/4 h-24 w-48 rounded-full bg-white/50 blur-2xl animate-float-fast"></div>
        <div className="absolute bottom-20 right-1/3 h-20 w-40 rounded-full bg-white/40 blur-xl animate-float"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Animated delivery truck/icon */}
        <div className="relative mx-auto mb-8 w-40 h-40">
          <div className="absolute inset-0 animate-bounce-slow">
            <svg
              className="w-full h-full text-sky-600 drop-shadow-xl"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-9 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM20 8h-3V5h-2v3h-3v2h3v3h2v-3h3V8zM5 15h14v-2H5v2z" />
            </svg>
          </div>
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-5xl animate-spin-slow">
            📦
          </div>
        </div>

        {/* Company name with cute style */}
        <h1 className="mb-3 text-5xl font-bold text-sky-800 drop-shadow-md">
          <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
            رھبر سافٹ
          </span>
        </h1>

        {/* Rotating friendly messages */}
        <div className="h-12 overflow-hidden">
          <p
            key={messageIndex}
            className="text-xl text-sky-700 animate-fade-in-up"
          >
            {messages[messageIndex]}
          </p>
        </div>

        {/* Cute progress bar with stars */}
        <div className="mt-10 relative">
          <div className="mx-auto h-3 w-72 rounded-full bg-sky-200/70 backdrop-blur-sm overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 animate-progress"
              style={{ animation: "progress 3.5s ease-in-out forwards" }}
            ></div>
          </div>
          {/* Floating stars */}
          <div className="absolute -top-6 left-1/4 text-yellow-300 animate-twinkle">
            ⭐
          </div>
          <div className="absolute -bottom-4 right-1/4 text-yellow-300 animate-twinkle-delay">
            ✨
          </div>
        </div>

        {/* Small tagline */}
        <p className="mt-6 text-sm text-sky-600 animate-pulse">
          Delivery Management System
        </p>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(10px);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(-15px);
          }
        }
        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(20px);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-progress {
          animation: progress 3.5s ease-in-out forwards;
        }
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        .animate-float-slow {
          animation: float-slow 10s infinite ease-in-out;
        }
        .animate-float-medium {
          animation: float-medium 8s infinite ease-in-out;
        }
        .animate-float-fast {
          animation: float-fast 5s infinite ease-in-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-twinkle {
          animation: twinkle 2s infinite;
        }
        .animate-twinkle-delay {
          animation: twinkle 2s infinite 1s;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
