import React from "react";
import xelyraLogo from "../../../public/xelyra.png";

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#18191c] via-[#23232a] to-[#191a1e] animate-fade-in">
      <div className="relative flex items-center justify-center mb-8">
        {/* Glowing animated orbits */}
        <div className="absolute animate-spin-slow rounded-full border-4 border-indigo-500/30 w-32 h-32" />
        <div className="absolute animate-spin-reverse rounded-full border-2 border-purple-500/20 w-20 h-20" />
        <img
          src={xelyraLogo}
          alt="Xelyra Logo"
          className="w-24 h-24 z-10 drop-shadow-xl animate-pulse"
          style={{ filter: "drop-shadow(0 0 32px #6366f1)" }}
        />
      </div>
      <h1 className="text-3xl font-extrabold text-indigo-300 tracking-widest mb-2 animate-fade-in-slow">
        Xelyra
      </h1>
      <p className="text-gray-400 text-lg font-medium animate-fade-in-slow">
        Loading your world...
      </p>
      <style>{`
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 2.5s linear infinite; }
        @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
        .animate-spin-reverse { animation: spin-reverse 3.5s linear infinite; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.7s ease-in; }
        .animate-fade-in-slow { animation: fade-in 1.5s ease-in; }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
