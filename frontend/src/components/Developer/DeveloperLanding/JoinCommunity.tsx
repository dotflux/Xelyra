import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const JoinCommunity = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([".join-title", ".join-desc", ".join-link"], {
        opacity: 1,
        y: 0,
      });
      gsap.from(".join-title", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".join-title",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".join-desc", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: {
          trigger: ".join-desc",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".join-link", {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.15,
        delay: 0.4,
        scrollTrigger: {
          trigger: ".join-link",
          start: "top 90%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.to(".join-link svg", {
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
    <section ref={ref} className="relative z-10 max-w-3xl mx-auto px-4 py-16">
      <h2 className="join-title text-3xl md:text-4xl font-bold text-white mb-4 text-center drop-shadow">
        Join the Xelyra Community
      </h2>
      <div className="join-desc text-gray-300 text-center mb-8">
        Get help, share your projects, and connect with other developers on X
        (Twitter) and GitHub.
      </div>
      <div className="flex flex-row items-center justify-center gap-8">
        <a
          href="https://x.com/dotflux56"
          target="_blank"
          rel="noopener noreferrer"
          className="join-link group flex flex-col items-center gap-2 hover:scale-110 transition-all relative"
        >
          <svg
            className="w-12 h-12 text-white group-hover:text-blue-400 transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.53 2H21.5l-7.39 8.42L22.5 22h-7.19l-5.6-6.77L2.5 22H.5l7.97-9.08L1.5 2h7.19l5.13 6.2L17.53 2zm-2.1 17h2.13l-5.98-7.23-1.52 1.73L15.43 19zm-7.36-2.2l1.52-1.73L3.43 5h-2.13l5.97 7.8zm2.1-13h-2.13l5.98 7.23 1.52-1.73L8.57 3.8zm7.36 2.2l-1.52 1.73L20.57 19h2.13l-5.97-7.8z" />
          </svg>
          <span className="text-white font-medium">@dotflux56</span>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
        </a>
        <a
          href="https://github.com/dotflux"
          target="_blank"
          rel="noopener noreferrer"
          className="join-link group flex flex-col items-center gap-2 hover:scale-110 transition-all relative"
        >
          <svg
            className="w-12 h-12 text-gray-300 group-hover:text-white transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.304-.535-1.527.117-3.184 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.657.242 2.88.119 3.184.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.104.823 2.225 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-gray-200 font-medium">GitHub</span>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-gray-400 to-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
        </a>
      </div>
    </section>
  );
};

export default JoinCommunity;
