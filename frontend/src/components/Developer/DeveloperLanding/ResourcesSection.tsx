import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const resources = [
  {
    label: "Docs",
    href: "https://docs.xelyra.com",
    icon: (
      <svg
        className="w-8 h-8 text-blue-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M7 8h10M7 12h6m-6 4h10" />
        <rect x="3" y="4" width="18" height="16" rx="2" />
      </svg>
    ),
    color: "from-blue-500 to-indigo-500",
  },
  {
    label: "SDK",
    href: "https://github.com/dotflux/xelyra-bot-sdk",
    icon: (
      <svg
        className="w-8 h-8 text-purple-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M8 12h8" />
      </svg>
    ),
    color: "from-purple-500 to-pink-500",
  },
  {
    label: "Community",
    href: "https://x.com/dotflux56",
    icon: (
      <svg
        className="w-8 h-8 text-blue-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M17.53 2H21.5l-7.39 8.42L22.5 22h-7.19l-5.6-6.77L2.5 22H.5l7.97-9.08L1.5 2h7.19l5.13 6.2L17.53 2zm-2.1 17h2.13l-5.98-7.23-1.52 1.73L15.43 19zm-7.36-2.2l1.52-1.73L3.43 5h-2.13l5.97 7.8zm2.1-13h-2.13l5.98 7.23 1.52-1.73L8.57 3.8zm7.36 2.2l-1.52 1.73L20.57 19h2.13l-5.97-7.8z" />
      </svg>
    ),
    color: "from-blue-400 to-purple-400",
  },
  {
    label: "Branding",
    href: "https://xelyra.com/branding",
    icon: (
      <svg
        className="w-8 h-8 text-yellow-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2 2 4-4" />
      </svg>
    ),
    color: "from-yellow-400 to-pink-400",
  },
];

const ResourcesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([".resource-btn"], { opacity: 1, y: 0, scale: 1 });
      gsap.from(".resource-btn", {
        y: 60,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.to(".resource-btn svg", {
        y: -8,
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
    <section ref={ref} className="relative z-10 max-w-5xl mx-auto px-4 py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center drop-shadow">
        Resources
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {resources.map((r, i) => (
          <a
            key={i}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`resource-btn group flex flex-col items-center justify-center gap-4 bg-gradient-to-br ${r.color} border border-[#23243a] rounded-2xl p-10 shadow-xl backdrop-blur-md hover:scale-105 hover:shadow-blue-500/20 transition-all duration-300 min-h-[160px] relative`}
          >
            <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-0"></div>
            <div className="relative z-10">{r.icon}</div>
            <div className="text-lg font-semibold text-white relative z-10">
              {r.label}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ResourcesSection;
