import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const DevCTA = () => {
  const ctaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([".dev-cta-title", ".dev-cta-desc", ".dev-cta-btn"], {
        opacity: 1,
        y: 0,
        scale: 1,
      });
      gsap.from(".dev-cta-title", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".dev-cta-title",
          start: "top 90%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".dev-cta-desc", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: {
          trigger: ".dev-cta-desc",
          start: "top 90%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".dev-cta-btn", {
        scale: 0.95,
        opacity: 0,
        duration: 0.7,
        ease: "back.out(1.7)",
        delay: 0.4,
        scrollTrigger: {
          trigger: ".dev-cta-btn",
          start: "top 95%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
    }, ctaRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ctaRef}
      className="relative z-10 max-w-2xl mx-auto mb-20 px-4"
    >
      <div className="dev-cta-title text-2xl md:text-3xl font-bold text-white mb-2 text-center">
        Ready to build your first bot?
      </div>
      <div className="dev-cta-desc text-gray-300 text-center mb-6">
        Get started by creating a new application in the Developer Portal.
        Explore docs, try the SDK, and join our community!
      </div>
      <div className="flex justify-center">
        <button
          className="dev-cta-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl transition-all duration-200 hover:scale-105"
          onClick={() => navigate("/developer/development/applications")}
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default DevCTA;
