import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const AnimatedBackground = () => {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate gradient movement
      gsap.to(".dev-bg-gradient", {
        backgroundPosition: "200% 200%",
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
      // Animate floating circles
      gsap.to(".dev-bg-circle", {
        y: "-=40",
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5,
      });
    }, bgRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={bgRef} className="fixed inset-0 z-0 pointer-events-none">
      <div
        className="dev-bg-gradient absolute inset-0"
        style={{
          background: "linear-gradient(120deg, #181a1e 0%, #23243a 100%)",
          backgroundSize: "200% 200%",
          filter: "blur(0px)",
          transition: "background-position 1s",
        }}
      />
      {/* Floating circles */}
      <div className="dev-bg-circle absolute top-1/4 left-1/5 w-40 h-40 bg-indigo-700/30 rounded-full blur-2xl" />
      <div className="dev-bg-circle absolute top-2/3 left-2/3 w-32 h-32 bg-purple-700/30 rounded-full blur-2xl" />
      <div className="dev-bg-circle absolute top-1/2 left-3/4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
    </div>
  );
};

export default AnimatedBackground;
