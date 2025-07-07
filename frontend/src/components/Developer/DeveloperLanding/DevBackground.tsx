import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const DevBackground = () => {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate orbs
      gsap.to(".dev-orb-1", {
        x: 60,
        y: -40,
        scale: 1.2,
        duration: 12,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(".dev-orb-2", {
        x: -50,
        y: 70,
        scale: 0.8,
        duration: 15,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2,
      });
      gsap.to(".dev-orb-3", {
        x: 40,
        y: -60,
        scale: 1.1,
        duration: 18,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 4,
      });
      // Animate particles
      const particles = bgRef.current?.querySelectorAll(".dev-particle");
      if (particles) {
        gsap.to(particles, {
          y: -100,
          x: "random(-50, 50)",
          rotation: "random(-180, 180)",
          duration: "random(8, 15)",
          ease: "none",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.5, from: "random" },
        });
        gsap.to(particles, {
          scale: "random(0.5, 1.5)",
          duration: "random(3, 6)",
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.3, from: "random" },
        });
        gsap.to(particles, {
          opacity: "random(0.08, 0.18)",
          duration: "random(4, 8)",
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.7, from: "random" },
        });
      }
      // Animate SVG lines
      gsap.to(".dev-bg-line", {
        x: 20,
        duration: 8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.5,
      });
    }, bgRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={bgRef}
      className="fixed inset-0 z-0 z-[-1] pointer-events-none bg-[#181a1e]"
    >
      <div className="dev-gradient-overlay absolute inset-0 bg-gradient-to-br from-[#181a1e] via-[#23243a] to-[#181a1e] opacity-80 transition-all duration-1000" />
      {/* Orbs */}
      <div className="dev-orb-1 absolute top-1/4 left-1/5 w-64 h-64 bg-indigo-700/30 rounded-full blur-3xl" />
      <div className="dev-orb-2 absolute top-2/3 left-2/3 w-48 h-48 bg-purple-700/30 rounded-full blur-2xl" />
      <div className="dev-orb-3 absolute top-1/2 left-3/4 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl" />
      {/* Particles */}
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className="dev-particle absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
      {/* Animated SVG lines for extra depth */}
      <svg
        className="dev-bg-line absolute left-0 top-1/4 w-40 h-40 opacity-30"
        viewBox="0 0 160 160"
        fill="none"
      >
        <path
          d="M10 80 Q80 10 150 80 Q80 150 10 80"
          stroke="#7f9cf5"
          strokeWidth="2"
        />
      </svg>
      <svg
        className="dev-bg-line absolute right-0 bottom-1/4 w-40 h-40 opacity-20"
        viewBox="0 0 160 160"
        fill="none"
      >
        <path
          d="M150 80 Q80 150 10 80 Q80 10 150 80"
          stroke="#a78bfa"
          strokeWidth="2"
        />
      </svg>
      <svg
        className="dev-bg-line absolute left-1/3 top-0 w-32 h-32 opacity-10"
        viewBox="0 0 128 128"
        fill="none"
      >
        <circle cx="64" cy="64" r="60" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

export default DevBackground;
