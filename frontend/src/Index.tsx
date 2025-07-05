import Navigation from "./components/landing/Navigation";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import TechStack from "./components/landing/TechStack";
import DeveloperInfo from "./components/landing/DeveloperInfo";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";
import Background from "./components/landing/Background";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <Background />

      <Navigation />
      <Hero />
      <Features />
      <TechStack />
      <DeveloperInfo />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
