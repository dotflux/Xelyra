import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const CTA: React.FC = () => {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ensure everything starts visible
      gsap.set(".cta-container", { opacity: 1, y: 0 });
      gsap.set(".cta-title", { opacity: 1, y: 0 });
      gsap.set(".cta-subtitle", { opacity: 1, y: 0 });
      gsap.set(".cta-buttons", { opacity: 1, y: 0 });
      gsap.set(".cta-button", { opacity: 1, scale: 1, y: 0 });

      // Main container animation
      gsap.from(".cta-container", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".cta-container",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Title animation with character splitting
      const title = document.querySelector(".cta-title");
      if (title) {
        const chars = title.textContent?.split("") || [];
        title.innerHTML = chars
          .map(
            (char) =>
              `<span class="cta-char">${char === " " ? "&nbsp;" : char}</span>`
          )
          .join("");

        gsap.from(".cta-char", {
          y: 50,
          opacity: 0,
          rotation: 15,
          duration: 0.8,
          stagger: 0.03,
          ease: "back.out(1.7)",
          delay: 0.3,
          scrollTrigger: {
            trigger: ".cta-title",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Subtitle animation
      gsap.from(".cta-subtitle", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.8,
        scrollTrigger: {
          trigger: ".cta-subtitle",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Buttons staggered animation
      gsap.from(".cta-button", {
        y: 30,
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 1.2,
        scrollTrigger: {
          trigger: ".cta-buttons",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Continuous floating animation for buttons
      gsap.to(".cta-button", {
        y: -3,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.2,
      });

      // Button hover animations
      const buttons = document.querySelectorAll(".cta-button");
      buttons.forEach((button) => {
        button.addEventListener("mouseenter", () => {
          gsap.to(button, {
            scale: 1.05,
            y: -5,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        button.addEventListener("mouseleave", () => {
          gsap.to(button, {
            scale: 1,
            y: -3,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });

      // Text glow effect on hover
      const titleSpans = document.querySelectorAll(".cta-char");
      titleSpans.forEach((span) => {
        span.addEventListener("mouseenter", () => {
          gsap.to(span, {
            color: "#3b82f6",
            textShadow: "0 0 20px #3b82f6",
            scale: 1.2,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        span.addEventListener("mouseleave", () => {
          gsap.to(span, {
            color: "#ffffff",
            textShadow: "none",
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });

      // Background pulse animation
      gsap.to(".cta-container", {
        background:
          "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, ctaRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ctaRef} className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="cta-container text-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-12 lg:p-16 rounded-3xl border border-[#3a3a3a] relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-pink-400/25 rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-400/20 rounded-full animate-pulse delay-1500"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-yellow-400/15 rounded-full animate-pulse delay-2000"></div>
          </div>

          <div className="relative z-10">
            <h2 className="cta-title text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="cta-subtitle text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of users who are already experiencing the future of
              messaging
            </p>
            <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
              <button className="cta-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Messaging Now
              </button>
              <button className="cta-button border-2 border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-gray-800/50">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
