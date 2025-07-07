import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const DevHero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([".dev-hero-title", ".dev-hero-subtitle", ".dev-hero-btn"], {
        opacity: 1,
        y: 0,
      });
      gsap.from(".dev-hero-title", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".dev-hero-title",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".dev-hero-subtitle", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.3,
        scrollTrigger: {
          trigger: ".dev-hero-subtitle",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".dev-hero-btn", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.6,
        scrollTrigger: {
          trigger: ".dev-hero-btn",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] pt-24 pb-10 px-4"
    >
      <h1 className="dev-hero-title text-5xl md:text-7xl font-extrabold text-white text-center leading-tight drop-shadow mb-4">
        Build for{" "}
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Xelyra
        </span>
      </h1>
      <p className="dev-hero-subtitle text-xl md:text-2xl text-gray-300 text-center max-w-2xl mb-8">
        Create bots, automate servers, and power up your community with the
        Xelyra Developer Portal and SDK.
      </p>
      <button
        className="dev-hero-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => navigate("/developer/development/applications")}
      >
        Go to Developer Portal
      </button>
    </section>
  );
};

export default DevHero;
