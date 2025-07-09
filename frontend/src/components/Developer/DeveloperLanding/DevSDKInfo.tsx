import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const sdkCode = `import { XelyraClient } from 'xelyra-bot-sdk';

const client = new XelyraClient({ token: 'YOUR_BOT_TOKEN' });

client.command('hello', (ctx) => {
  ctx.send('Hello, world!');
});

client.login();`;

const DevSDKInfo = () => {
  const sdkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(
        [
          ".dev-sdk-title",
          ".dev-sdk-desc",
          ".dev-sdk-how",
          ".dev-sdk-codeblock",
        ],
        { opacity: 1, y: 0 }
      );
      gsap.from(".dev-sdk-title", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".dev-sdk-title",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".dev-sdk-desc", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.1,
        scrollTrigger: {
          trigger: ".dev-sdk-desc",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".dev-sdk-how", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: {
          trigger: ".dev-sdk-how",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".dev-sdk-codeblock", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.3,
        scrollTrigger: {
          trigger: ".dev-sdk-codeblock",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
      // Floating/glow effect for code block
      gsap.to(".dev-sdk-codeblock", {
        boxShadow: "0 0 32px 0 #7f9cf5, 0 0 64px 0 #a78bfa33",
        y: -8,
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut",
      });
    }, sdkRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sdkRef}
      className="relative z-10 max-w-5xl mx-auto mt-8 mb-16 px-4"
    >
      {/* Animated orbs for side background */}
      <div className="absolute -left-32 top-1/3 w-64 h-64 bg-blue-700/20 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute -right-32 top-1/2 w-72 h-72 bg-purple-700/20 rounded-full blur-3xl animate-pulse z-0" />
      <div className="relative z-10">
        <div className="dev-sdk-title text-3xl md:text-4xl font-bold text-indigo-300 mb-2">
          Xelyra Bot SDK
        </div>
        <div className="dev-sdk-desc text-lg text-gray-300 mb-4 max-w-2xl">
          The Xelyra Bot SDK lets you create bots and automations for your
          servers with just a few lines of code. Register commands, handle
          events, and interact with the Xelyra platform easily and securely.
        </div>
        <div className="dev-sdk-how text-base text-gray-400 mb-6">
          <ol className="list-decimal list-inside pl-4">
            <li>Install the SDK in your Node.js project.</li>
            <li>
              Register your bot and get a token from the Developer Portal.
            </li>
            <li>Write your bot logic using the SDK's simple API.</li>
            <li>Deploy and manage your bot from the portal.</li>
          </ol>
        </div>
        <pre
          className="dev-sdk-codeblock w-full bg-gradient-to-br from-[#181a1e] via-[#181a1e] to-[#23243a] border border-[#23243a] rounded-xl p-6 text-left text-sm text-gray-100 font-mono overflow-x-auto shadow-xl mb-2 backdrop-blur-md transition-all duration-500"
          style={{ lineHeight: 1.6 }}
        >
          <code>
            {sdkCode.split("\n").map((line, i) => (
              <span
                key={i}
                className={
                  line.trim().startsWith("import")
                    ? "text-blue-400"
                    : line.trim().startsWith("const")
                    ? "text-purple-400"
                    : line.trim().startsWith("client.command")
                    ? "text-green-400"
                    : line.trim().startsWith("client.login")
                    ? "text-yellow-400"
                    : line.includes("ctx.reply")
                    ? "text-pink-400"
                    : ""
                }
              >
                {line + "\n"}
              </span>
            ))}
          </code>
        </pre>
        <div className="text-xs text-gray-500 text-right">
          Syntax: JavaScript (SDK)
        </div>
      </div>
    </section>
  );
};

export default DevSDKInfo;
