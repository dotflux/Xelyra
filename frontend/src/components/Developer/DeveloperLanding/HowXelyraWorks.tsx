import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const steps = [
  {
    icon: (
      <svg
        className="w-12 h-12 text-blue-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <rect x="4" y="4" width="16" height="16" rx="4" />
      </svg>
    ),
    label: "Register App",
  },
  {
    icon: (
      <svg
        className="w-12 h-12 text-purple-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M12 20v-6m0 0V4m0 10h6m-6 0H6" />
      </svg>
    ),
    label: "Build Bot",
  },
  {
    icon: (
      <svg
        className="w-12 h-12 text-green-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
    label: "Deploy",
  },
  {
    icon: (
      <svg
        className="w-12 h-12 text-yellow-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    label: "Power Community",
  },
];

const HowXelyraWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([".how-step", ".how-arrow"], { opacity: 1, y: 0, scale: 1 });
      gsap.from(".how-step", {
        y: 60,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".how-arrow", {
        scale: 0.7,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.to(".how-step svg", {
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
    <section ref={ref} className="relative z-10 max-w-6xl mx-auto px-4 py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center drop-shadow">
        How Xelyra Works
      </h2>
      <div className="flex flex-row items-center justify-center gap-0 md:gap-8 flex-wrap md:flex-nowrap">
        {steps.map((step, i) => (
          <>
            <div
              key={step.label}
              className="how-step bg-gradient-to-br from-[#23243a]/80 to-[#181a1e]/80 border border-[#23243a] rounded-2xl p-8 flex flex-col items-center text-center shadow-xl backdrop-blur-md mx-2 min-w-[180px]"
            >
              <div className="mb-4">{step.icon}</div>
              <div className="text-lg font-semibold text-indigo-200 mb-2">
                {step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <svg
                className="how-arrow w-10 h-10 text-indigo-400 mx-2 hidden md:block"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </>
        ))}
      </div>
    </section>
  );
};

export default HowXelyraWorks;
