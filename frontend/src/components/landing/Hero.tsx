import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import xelyraIcon from "../../../public/xelyra-icon.png";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".hero-subtitle", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.3,
      });

      gsap.from(".hero-buttons", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.6,
      });

      gsap.from(".hero-image", {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)",
        delay: 0.2,
      });

      // Floating animation for hero image
      gsap.to(".hero-image", {
        y: -20,
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.5,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative z-10 flex items-center justify-center min-h-screen px-8"
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12 items-center">
        <div className="lg:col-span-2 space-y-8">
          <h1 className="hero-title text-5xl lg:text-7xl font-bold text-white leading-tight">
            Your Place to
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Talk & Hang Out
            </span>
          </h1>
          <p className="hero-subtitle text-xl text-gray-300 leading-relaxed">
            Xelyra is the easiest way to communicate over voice, video, and
            text. Whether you're part of a school club, gaming group, worldwide
            art community, or just a handful of friends that want to spend time
            together.
          </p>
          <div className="hero-buttons flex flex-col sm:flex-row gap-4">
            <Link
              to="https://github.com/dotflux/Xelyra"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center group"
            >
              <svg
                className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Github Repostory
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-gray-600 hover:border-blue-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 hover:bg-blue-500/10 flex items-center justify-center group"
            >
              <svg
                className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Open Xelyra in your browser
            </Link>
          </div>
        </div>
        <div className="hero-image flex justify-center lg:justify-end">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
            <div className="relative bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-3xl p-8 shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300 border border-[#2a2a2a]">
              <img
                src={xelyraIcon}
                alt="Xelyra App"
                className="w-32 h-32 rounded-2xl object-contain"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0f0f0f] animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
