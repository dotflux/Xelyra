import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import AnimatedBackground from "./AnimatedBackground";
import DevBackground from "./DevBackground";
import DevHero from "./DevHero";
import DevSDKInfo from "./DevSDKInfo";
import DevCTA from "./DevCTA";
import WhyBuild from "./WhyBuild";
import WhatCanYouBuild from "./WhatCanYouBuild";
import JoinCommunity from "./JoinCommunity";
import HowXelyraWorks from "./HowXelyraWorks";
import ResourcesSection from "./ResourcesSection";
import StickyNav from "./StickyNav";
import Footer from "./Footer";

const sdkCode = `import { XelyraClient } from 'xelyra-bot-sdk';

const client = new XelyraClient({ token: 'YOUR_BOT_TOKEN' });

client.command('hello', (ctx) => {
  ctx.reply('Hello, world!');
});

client.login();`;

const DeveloperLanding = () => {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dev-landing-top-btn", {
        y: -30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });
      gsap.from(".dev-landing-card", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.1,
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-x-hidden bg-transparent pt-28">
      <StickyNav />
      <DevBackground />
      <div id="hero">
        <DevHero />
      </div>
      <div id="why">
        <WhyBuild />
      </div>
      <div id="what">
        <WhatCanYouBuild />
      </div>
      <div id="how">
        <HowXelyraWorks />
      </div>
      <div id="resources">
        <ResourcesSection />
      </div>
      <div id="sdk">
        <DevSDKInfo />
      </div>
      <div id="community">
        <JoinCommunity />
      </div>
      <div id="cta" className="mb-32">
        <DevCTA />
      </div>
      <Footer />
    </div>
  );
};

export default DeveloperLanding;
