import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import xelyraIcon from "../../../public/xelyra-icon.png";

const Navigation = () => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo animation
      gsap.from(".nav-logo", {
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Logo icon rotation
      gsap.from(".nav-logo-icon", {
        rotation: -180,
        scale: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.2,
      });

      // Logo text animation
      gsap.from(".nav-logo-text", {
        x: -20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.4,
      });

      // Navigation links animation
      gsap.from(".nav-links", {
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.3,
      });

      // Individual link animations - ensure they start visible
      gsap.set(".nav-link", { opacity: 1 });
      gsap.from(".nav-link", {
        y: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      });

      // Sign up button - keep it simple and visible
      gsap.set(".nav-signup", { opacity: 1, scale: 1, rotation: 0 });

      // Logo hover animation
      const logo = document.querySelector(".nav-logo");
      if (logo) {
        logo.addEventListener("mouseenter", () => {
          gsap.to(".nav-logo-icon", {
            rotation: 360,
            scale: 1.1,
            duration: 0.5,
            ease: "power2.out",
          });

          gsap.to(".nav-logo-text", {
            x: 5,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        logo.addEventListener("mouseleave", () => {
          gsap.to(".nav-logo-icon", {
            rotation: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          });

          gsap.to(".nav-logo-text", {
            x: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      }

      // Link hover animations
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach((link) => {
        link.addEventListener("mouseenter", () => {
          gsap.to(link, {
            y: -2,
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
          });
        });

        link.addEventListener("mouseleave", () => {
          gsap.to(link, {
            y: 0,
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        });
      });

      // Sign up button hover animation
      const signupBtn = document.querySelector(".nav-signup");
      if (signupBtn) {
        signupBtn.addEventListener("mouseenter", () => {
          gsap.to(signupBtn, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
          });
        });

        signupBtn.addEventListener("mouseleave", () => {
          gsap.to(signupBtn, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        });
      }
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className="relative z-10 flex items-center justify-between px-8 py-6"
    >
      <div className="nav-logo flex items-center space-x-3 cursor-pointer">
        <img
          src={xelyraIcon}
          alt="Xelyra"
          className="nav-logo-icon w-10 h-10"
        />
        <span className="nav-logo-text text-2xl font-bold text-white">
          Xelyra
        </span>
      </div>
      <div className="nav-links flex items-center space-x-6">
        <Link
          to="/login"
          className="nav-link text-gray-300 hover:text-white transition-colors duration-200 font-medium"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="nav-signup bg-[#7289DA] hover:bg-[#5b6eae] text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
