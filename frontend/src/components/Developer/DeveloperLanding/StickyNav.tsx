import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import xelyraIcon from "../../../../public/xelyra-icon.png";

const sections = [
  { id: "hero", label: "Home" },
  { id: "why", label: "Why Xelyra" },
  { id: "what", label: "What You Can Build" },
  { id: "how", label: "How It Works" },
  { id: "resources", label: "Resources" },
  { id: "sdk", label: "SDK" },
  { id: "community", label: "Community" },
  { id: "cta", label: "Get Started" },
];

const StickyNav = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -32,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      let found = "hero";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight / 2) {
            found = s.id;
          }
        }
      }
      setActive(found);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-[#23243a]/95 to-[#181a1e]/95 border-b border-[#23243a] h-16 flex items-center justify-between px-8 shadow-xl backdrop-blur-md"
      style={{ minHeight: 56 }}
    >
      {/* Brand/Logo */}
      <div className="flex items-center gap-2">
        <img src={xelyraIcon} alt="Xelyra" className="w-8 h-8 rounded-lg" />
        <span className="text-white font-extrabold text-lg tracking-wide">
          Xelyra
        </span>
      </div>
      {/* Centered Links */}
      <div className="flex-1 flex items-center justify-center gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`px-4 py-1.5 rounded font-semibold text-base transition-all duration-200 focus:outline-none ${
              active === s.id
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow"
                : "text-gray-200 hover:bg-gray-700/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {/* CTA (optional) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => scrollToSection("cta")}
          className="bg-white text-black font-bold px-5 py-1.5 rounded-full shadow hover:bg-gray-200 transition-all duration-200"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default StickyNav;
