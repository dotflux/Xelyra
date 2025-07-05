import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Features: React.FC = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8 text-white feature-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Voice & Video",
      description:
        "Crystal clear voice and video calls with friends and communities. Stay connected with high-quality audio and video.",
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-white feature-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      title: "Real-time Chat",
      description:
        "Instant messaging with friends and communities. Share thoughts, ideas, and stay updated in real-time.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-white feature-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Groups",
      description:
        "Create and join groups around your interests. Connect with like-minded people and build lasting friendships.",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-white feature-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
          />
        </svg>
      ),
      title: "Servers",
      description:
        "Organize your communities into servers with multiple channels. Keep conversations organized and easy to navigate.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-white feature-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
      title: "Developer Portal",
      description:
        "Build powerful bots and integrations with our comprehensive API. Create custom experiences for your communities.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-white feature-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Smart Bots",
      description:
        "Automate moderation, welcome new members, create polls, and enhance your server with intelligent bot integrations.",
      gradient: "from-yellow-500 to-orange-600",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ensure everything starts visible
      gsap.set(".features-container", { opacity: 1, y: 0 });
      gsap.set(".features-title", { opacity: 1, y: 0 });
      gsap.set(".features-subtitle", { opacity: 1, y: 0 });
      gsap.set(".feature-card", { opacity: 1, y: 0, scale: 1 });

      // Main container animation
      gsap.from(".features-container", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-container",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Title animation
      gsap.from(".features-title", {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-title",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Subtitle animation
      gsap.from(".features-subtitle", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: {
          trigger: ".features-subtitle",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Feature cards staggered animation
      gsap.from(".feature-card", {
        y: 60,
        opacity: 0,
        scale: 0.8,
        rotation: 5,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Icon floating animation
      gsap.to(".feature-icon", {
        y: -10,
        duration: 2.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.1,
      });

      // Card hover animations
      gsap.set(".feature-card", {
        transformOrigin: "center center",
      });

      // Add hover listeners for each card
      const cards = document.querySelectorAll(".feature-card");
      cards.forEach((card, index) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -8,
            scale: 1.03,
            duration: 0.3,
            ease: "power2.out",
          });

          // Animate the icon on hover
          gsap.to(card.querySelector(".feature-icon"), {
            scale: 1.1,
            rotation: 5,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });

          // Reset the icon
          gsap.to(card.querySelector(".feature-icon"), {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    }, featuresRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={featuresRef} className="relative z-10 py-20 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="features-container text-center mb-16">
          <h2 className="features-title text-4xl lg:text-5xl font-bold text-white mb-6">
            Reliable tech for staying close
          </h2>
          <p className="features-subtitle text-xl text-gray-300 max-w-3xl mx-auto">
            Low-latency voice and video feels like you're in the same room. Wave
            hello over video, watch friends stream their games, or gather up and
            have a drawing session with screen share.
          </p>
        </div>

        <div className="features-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] p-8 rounded-2xl border border-[#2a2a2a] hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group cursor-pointer"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
