import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Floating Particles Component
const FloatingParticles = () => {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particles = particlesRef.current?.children;
    if (!particles) return;

    const ctx = gsap.context(() => {
      // Enhanced particle animations
      gsap.to(particles, {
        y: -100,
        x: "random(-50, 50)",
        rotation: "random(-180, 180)",
        duration: "random(8, 15)",
        ease: "none",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.5,
          from: "random",
        },
      });

      // Particle scale animation
      gsap.to(particles, {
        scale: "random(0.5, 1.5)",
        duration: "random(3, 6)",
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        stagger: {
          each: 0.3,
          from: "random",
        },
      });

      // Particle opacity animation
      gsap.to(particles, {
        opacity: "random(0.1, 0.3)",
        duration: "random(4, 8)",
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        stagger: {
          each: 0.7,
          from: "random",
        },
      });
    }, particlesRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={particlesRef} className="fixed inset-0 pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

// Animated Gradient Background
const AnimatedGradient = () => {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced gradient overlay animation
      gsap.to(".gradient-overlay", {
        opacity: 0.3,
        duration: 6,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Enhanced floating orb animations
      gsap.to(".floating-orb-1", {
        x: 80,
        y: -50,
        scale: 1.3,
        duration: 12,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(".floating-orb-2", {
        x: -60,
        y: 80,
        scale: 0.7,
        duration: 15,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2,
      });

      gsap.to(".floating-orb-3", {
        x: 50,
        y: -70,
        scale: 1.2,
        duration: 18,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 4,
      });

      gsap.to(".floating-orb-4", {
        x: -80,
        y: 60,
        scale: 0.8,
        duration: 14,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });

      gsap.to(".floating-orb-5", {
        x: 70,
        y: -30,
        scale: 1.4,
        duration: 16,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 3,
      });

      // Orb rotation animations
      gsap.to(".floating-orb-1", {
        rotation: 360,
        duration: 20,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".floating-orb-2", {
        rotation: -360,
        duration: 25,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".floating-orb-3", {
        rotation: 360,
        duration: 30,
        ease: "none",
        repeat: -1,
      });

      // Interactive orb effects on mouse move
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;

        gsap.to(".floating-orb-1", {
          x: xPercent * 20,
          y: yPercent * 20,
          duration: 1,
          ease: "power2.out",
        });

        gsap.to(".floating-orb-2", {
          x: -xPercent * 15,
          y: -yPercent * 15,
          duration: 1,
          ease: "power2.out",
        });

        gsap.to(".floating-orb-3", {
          x: xPercent * 25,
          y: yPercent * 25,
          duration: 1,
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, gradientRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={gradientRef} className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]"></div>
      <div className="gradient-overlay absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 via-purple-500/8 to-indigo-500/10"></div>
      <div className="floating-orb-1 absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="floating-orb-2 absolute top-40 right-20 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl"></div>
      <div className="floating-orb-3 absolute bottom-20 left-1/2 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-3xl"></div>
      <div className="floating-orb-4 absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl"></div>
      <div className="floating-orb-5 absolute top-1/3 right-1/3 w-80 h-80 bg-purple-500/12 rounded-full blur-3xl"></div>
    </div>
  );
};

const Background = () => {
  return (
    <>
      <AnimatedGradient />
      <FloatingParticles />
    </>
  );
};

export default Background;
