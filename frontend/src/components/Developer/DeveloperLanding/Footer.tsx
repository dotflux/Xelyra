import xelyraIcon from "../../../../public/xelyra-icon.png";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="relative w-full bg-gradient-to-br from-[#181a1e]/95 to-[#23243a]/95 border-t border-[#23243a] py-10 px-4 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-md mt-20">
      {/* Logo and copyright */}
      <div className="flex items-center gap-3">
        <img src={xelyraIcon} alt="Xelyra" className="w-8 h-8 rounded-lg" />
        <span className="text-white font-extrabold text-lg tracking-wide">
          Xelyra
        </span>
        <span className="text-gray-400 text-sm ml-4">
          © {new Date().getFullYear()} Xelyra. All rights reserved.
        </span>
      </div>
      {/* Links */}
      <div className="flex items-center gap-6">
        <a
          href="https://github.com/dotflux/Xelyra"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-blue-400 font-medium transition-all"
        >
          Docs
        </a>
        <a
          href="https://github.com/dotflux/Xelyra/tree/main/xelyra-bot-sdk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-purple-400 font-medium transition-all"
        >
          SDK
        </a>
        <a
          href="https://x.com/dotflux56"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-blue-400 font-medium transition-all"
        >
          Twitter
        </a>
        <a
          href="https://dotflux.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-yellow-400 font-medium transition-all"
        >
          Developer
        </a>
      </div>
      {/* Final CTA */}
      <div>
        <button
          onClick={() => navigate("/developer/development")}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-6 py-2 rounded-full shadow hover:scale-105 transition-all duration-200"
        >
          Get Started
        </button>
      </div>
      {/* Animated gradient glow */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl rounded-full pointer-events-none z-0" />
    </footer>
  );
};

export default Footer;
