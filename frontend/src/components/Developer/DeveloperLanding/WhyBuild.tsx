import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: (
      <svg
        className="w-8 h-8 text-blue-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M12 4v16m8-8H4" />
      </svg>
    ),
    title: "Powerful APIs",
    desc: "Access real-time chat, server, and user APIs to build anything you imagine.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-purple-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2 2 4-4" />
      </svg>
    ),
    title: "Secure & Scalable",
    desc: "Built on modern tech, your bots and apps scale with your community.",
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
        <rect x="4" y="4" width="16" height="16" rx="4" />
      </svg>
    ),
    title: "Easy to Use SDK",
    desc: "Get started in minutes with a simple, modern SDK and great docs.",
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
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Active Community",
    desc: "Join a growing developer community for support, feedback, and fun.",
  },
];

const WhyBuild = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([".why-title", ".why-card"], { opacity: 1, y: 0 });
      gsap.from(".why-title", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".why-title",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".why-card", {
        y: 60,
        opacity: 0,
        scale: 0.9,
        rotation: 5,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".why-title",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.to(".why-card svg", {
        y: -10,
        duration: 2.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.1,
      });
      gsap.to(".why-card", {
        y: (i, _target) => (i % 2 === 0 ? -12 : 12),
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.2,
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="relative z-10 max-w-6xl mx-auto px-4 py-16">
      <h2 className="why-title text-3xl md:text-4xl font-bold text-white mb-10 text-center drop-shadow">
        Why build on Xelyra?
      </h2>
      <div className="flex md:grid md:grid-cols-4 gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x md:snap-none">
        {features.map((f, i) => (
          <div
            key={i}
            className="why-card bg-gradient-to-br from-[#23243a]/80 to-[#181a1e]/80 border border-[#23243a] rounded-2xl p-7 flex flex-col items-center text-center shadow-xl backdrop-blur-md hover:scale-105 hover:shadow-blue-500/20 transition-all duration-300 min-w-[220px] md:min-w-0 snap-center group relative"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-0"></div>
            <div className="mb-4 relative z-10">{f.icon}</div>
            <div className="text-lg font-semibold text-indigo-200 mb-2 relative z-10">
              {f.title}
            </div>
            <div className="text-gray-400 text-sm relative z-10">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyBuild;
