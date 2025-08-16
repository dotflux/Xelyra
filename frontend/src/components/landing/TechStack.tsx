import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Import tech logos
import nestjsLogo from "../../assets/tech/nestjs.svg";
import reactLogo from "../../assets/react.svg";
import typescriptLogo from "../../assets/tech/typescript.svg";
import tailwindLogo from "../../assets/tech/tailwindcss.svg";
import viteLogo from "/vite.svg";
import socketioLogo from "../../assets/tech/socketio.svg";
import jwtLogo from "../../assets/tech/jwt.svg";
import gsapLogo from "../../assets/tech/gsap.png";
import cassandraLogo from "../../assets/tech/cassandra.svg";
import redisLogo from "../../assets/tech/redis.svg";
import scyllaLogo from "../../assets/tech/scylla.png";
import nodemailerLogo from "../../assets/tech/nodemailer.svg";
import eslintLogo from "../../assets/tech/eslint.svg";
import jestLogo from "../../assets/tech/jest.svg";

gsap.registerPlugin(ScrollTrigger);

const TechStack: React.FC = () => {
  const techStackRef = useRef<HTMLDivElement>(null);

  const technologies = [
    { name: "NestJS", logo: nestjsLogo, category: "Backend" },
    { name: "React", logo: reactLogo, category: "Frontend" },
    { name: "TypeScript", logo: typescriptLogo, category: "Language" },
    { name: "TailwindCSS", logo: tailwindLogo, category: "Styling" },
    { name: "Vite", logo: viteLogo, category: "Build Tool" },
    { name: "Socket.IO", logo: socketioLogo, category: "Real-time" },
    { name: "JWT", logo: jwtLogo, category: "Authentication" },
    { name: "GSAP", logo: gsapLogo, category: "Animations" },
    { name: "Cassandra", logo: cassandraLogo, category: "Database" },
    { name: "Redis", logo: redisLogo, category: "Cache" },
    { name: "ScyllaDB", logo: scyllaLogo, category: "Database" },
    { name: "Nodemailer", logo: nodemailerLogo, category: "Email" },
    { name: "ESLint", logo: eslintLogo, category: "Linting" },
    { name: "Jest", logo: jestLogo, category: "Testing" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ensure elements start visible
      gsap.set(".tech-stack-container", { opacity: 1, y: 0 });
      gsap.set(".tech-stack-title", { opacity: 1, y: 0 });
      gsap.set(".tech-stack-subtitle", { opacity: 1, y: 0 });
      gsap.set(".tech-card", { opacity: 1, y: 0, scale: 1 });

      // Main container animation
      gsap.from(".tech-stack-container", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".tech-stack-container",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Title animation
      gsap.from(".tech-stack-title", {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".tech-stack-title",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Subtitle animation
      gsap.from(".tech-stack-subtitle", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: {
          trigger: ".tech-stack-subtitle",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Tech cards staggered animation
      gsap.from(".tech-card", {
        y: 50,
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".tech-grid",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Hover animations for tech cards
      const techCards = document.querySelectorAll(".tech-card");
      techCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -10,
            scale: 1.05,
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
        });
      });
    }, techStackRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={techStackRef} className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="tech-stack-container text-center mb-16">
          <h2 className="tech-stack-title text-4xl lg:text-5xl font-bold text-white mb-6">
            Built with Modern Tech Stack
          </h2>
          <p className="tech-stack-subtitle text-xl text-gray-300 max-w-3xl mx-auto">
            Xelyra leverages cutting-edge technologies to deliver a seamless,
            real-time messaging experience
          </p>
        </div>

        <div className="tech-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-6xl mx-auto">
          {technologies.map((tech, _index) => (
            <div
              key={tech.name}
              className="tech-card group bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-6 rounded-xl border border-[#3a3a3a] hover:border-gray-500 transition-all duration-300 cursor-pointer"
              title={tech.name}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <img
                    src={tech.logo}
                    alt={tech.name}
                    className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <span className="text-xs text-gray-400 text-center font-medium group-hover:text-white transition-colors duration-300">
                  {tech.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
