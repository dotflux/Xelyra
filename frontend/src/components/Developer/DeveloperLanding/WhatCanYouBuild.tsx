import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const examples = [
  {
    icon: (
      <svg
        className="w-8 h-8 text-green-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M9 17v-2a4 4 0 018 0v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "Moderation Bots",
    desc: "Automate server safety, filter spam, and manage roles with ease.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-blue-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M9 19V6h13" />
        <circle cx="6" cy="18" r="3" />
      </svg>
    ),
    title: "Music & Media",
    desc: "Stream music, share videos, and create interactive media bots.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-yellow-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6v6H9z" />
      </svg>
    ),
    title: "Analytics & Stats",
    desc: "Track server activity, user engagement, and custom metrics.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-pink-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09A1.65 1.65 0 008.91 3H9a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    title: "Custom Tools",
    desc: "Build unique integrations, games, and utilities for your community.",
  },
];

const WhatCanYouBuild = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([".what-title", ".what-card"], { opacity: 1, y: 0 });
      gsap.from(".what-title", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".what-title",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".what-card", {
        y: 60,
        opacity: 0,
        scale: 0.8,
        rotation: 5,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".what-title",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.to(".what-card svg", {
        y: -10,
        duration: 2.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.1,
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="relative z-10 max-w-5xl mx-auto px-4 py-16">
      <h2 className="what-title text-3xl md:text-4xl font-bold text-white mb-10 text-center drop-shadow">
        What can you build?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {examples.map((f, i) => (
          <div
            key={i}
            className="what-card bg-gradient-to-br from-[#23243a]/80 to-[#181a1e]/80 border border-[#23243a] rounded-2xl p-7 flex flex-col items-center text-center shadow-xl backdrop-blur-md hover:scale-105 hover:shadow-pink-500/20 transition-all duration-300"
          >
            <div className="mb-4">{f.icon}</div>
            <div className="text-lg font-semibold text-indigo-200 mb-2">
              {f.title}
            </div>
            <div className="text-gray-400 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhatCanYouBuild;
