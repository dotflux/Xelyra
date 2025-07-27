import React from "react";
import {
  FaRobot,
  FaPlug,
  FaCode,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaBookOpen,
} from "react-icons/fa";
import { SiJavascript, SiTypescript, SiNodedotjs } from "react-icons/si";
import createAppGif from "../../assets/create_app_and_token.gif";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const codeBlock = (code: string, language: string = "typescript") => (
  <SyntaxHighlighter
    language={language}
    style={atomDark}
    customStyle={{
      borderRadius: "0.5rem",
      fontSize: "0.95em",
      margin: "1em 0",
      background: "#18191c",
      border: "1px solid #23232a",
      padding: "1.2em",
    }}
    showLineNumbers={false}
  >
    {code}
  </SyntaxHighlighter>
);

const callout = (icon: React.ReactNode, text: string, color = "indigo") => (
  <div
    className={`flex items-center gap-2 bg-${color}-900/60 border-l-4 border-${color}-500 px-4 py-2 rounded mb-4`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-gray-200 text-base">{text}</span>
  </div>
);

const Documentation: React.FC = () => (
  <div className="max-w-4xl mx-auto p-8 text-gray-100">
    <div className="flex items-center gap-3 mb-6">
      <FaRobot className="text-indigo-400 text-4xl" />
      <h1 className="text-4xl font-extrabold text-indigo-300 tracking-tight">
        Xelyra Bot SDK Documentation
      </h1>
    </div>
    <div className="mb-8">
      {callout(
        <FaBookOpen />,
        "Welcome to the official SDK for building bots on Xelyra! This page covers everything you need to get started, from setup to advanced features.",
        "indigo"
      )}
    </div>

    <section className="mb-10">
      <h2 className="text-2xl font-bold text-indigo-200 mb-2 flex items-center gap-2">
        <FaPlug /> Connecting & Authentication
      </h2>
      <p className="mb-2 text-gray-300">
        If you want to use the latest SDK or contribute, clone the repo and
        install dependencies:
      </p>
      {codeBlock(
        `git clone https://github.com/dotflux/Xelyra.git
cd xelyra/xelyra-bot-sdk
npm install`,
        "bash"
      )}
      <p className="mb-2 text-gray-300">Or, install the SDK from npm:</p>
      {codeBlock(`npm install xelyra-bot-sdk`, "bash")}
      {codeBlock(`import { XelyraClient } from 'xelyra-bot-sdk';

const bot = new XelyraClient({
  token: 'YOUR_BOT_TOKEN',
});

bot.login();

bot.on('ready', () => {
  console.log('Bot is online!');
});`)}
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-bold text-indigo-200 mb-2 flex items-center gap-2">
        <FaCode /> Registering Commands
      </h2>
      <p className="mb-2 text-gray-300">
        Register a slash command with a handler, options, and description:
      </p>
      {codeBlock(`bot.command('ping', async (ctx) => {
  await ctx.send('Pong!');
}, [
  { name: 'target', type: 'string', description: 'Who to ping?' }
], 'Replies with Pong!');`)}
      <div className="text-gray-400 text-sm mb-2">
        You can register multiple commands. Options and description are
        optional.
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-bold text-indigo-200 mb-2 flex items-center gap-2">
        <FaCheckCircle /> Handling Interactions
      </h2>
      <p className="mb-2 text-gray-300">
        When a user invokes a command, your handler receives an{" "}
        <span className="font-mono text-indigo-300">InteractionContext</span>:
      </p>
      {codeBlock(`interface InteractionContext {
  command: string;
  userId: string;
  channelId: string;
  appId: string;
  botId: string;
  token: string;
  args: Record<string, any>;
  respond: (content: string, ephemeral?: boolean) => void;
  send: (message: string, embeds?: Embed[], buttons?: Button[]) => Promise<BotMessage>;
}`)}
      <div className="text-gray-400 text-sm mb-2">
        Use <span className="font-mono">ctx.respond()</span> for ephemeral
        replies, or <span className="font-mono">ctx.send()</span> to send a
        message to the channel.
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-bold text-indigo-200 mb-2 flex items-center gap-2">
        <SiJavascript className="text-yellow-400" />{" "}
        <SiTypescript className="text-blue-400" />{" "}
        <SiNodedotjs className="text-green-400" /> Message & Embed API
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#18191c] rounded-xl p-5 border border-[#23232a] shadow">
          <h3 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
            <FaCode /> Sending Messages
          </h3>
          {codeBlock(`const msg = await ctx.send('Hello, world!');`)}
          <div className="text-gray-400 text-sm">
            Returns a <span className="font-mono">BotMessage</span> object for
            further actions.
          </div>
        </div>
        <div className="bg-[#18191c] rounded-xl p-5 border border-[#23232a] shadow">
          <h3 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
            <FaEdit /> Editing Messages
          </h3>
          {codeBlock(`await msg.edit('Updated content!');
// Or update embeds and buttons:
await msg.edit('Updated content!', [
  { title: 'New Embed', description: 'Updated embed!', color: '#5865F2' }
],[{name:"Button",color:"primary",customId:"handler1"}]);`)}
        </div>
        <div className="bg-[#18191c] rounded-xl p-5 border border-[#23232a] shadow flex flex-col justify-start self-start">
          <h3 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
            <FaTrash /> Deleting Messages
          </h3>
          <div className="mb-0">{codeBlock(`await msg.delete();`)}</div>
        </div>
        <div className="bg-[#18191c] rounded-xl p-5 border border-[#23232a] shadow">
          <h3 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
            <FaCode /> Sending Embeds
          </h3>
          {codeBlock(`await ctx.send('Here is an embed!', [
  {
    title: 'Welcome to Xelyra!',
    description: 'This is a modern Discord-style embed.',
    color: '#5865F2',
    fields: [
      { name: 'Field 1', value: 'Some value' },
      { name: 'Field 2', value: 'Another value' },
    ],
    image: 'https://cataas.com/cat',
  },
]);`)}
        </div>
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-bold text-indigo-200 mb-2 flex items-center gap-2">
        <FaCode /> Buttons & Interactions
      </h2>
      <p className="mb-2 text-gray-300">
        You can add interactive buttons to your bot messages. Define buttons
        when sending a message, and register their callbacks using{" "}
        <span className="font-mono text-indigo-300">
          registerButtonCallback
        </span>
        .
      </p>
      {codeBlock(`// Register a command with buttons
bot.command("buttonTest", async (ctx) => {
  await ctx.send("Click a button!", [/** leave empty if no embed **/], [
    { name: "Primary", color: "primary", customId: "handler1" },
    { name: "Secondary", color: "secondary", customId: "handler2" },
  ]);
});

// Register button callbacks
bot.registerButtonCallback("buttonTest", "handler1", async (ctx) => {
  await ctx.send("Primary button clicked!");
});
bot.registerButtonCallback("buttonTest", "handler2", async (ctx) => {
  await ctx.send("Secondary button clicked!");
});
`)}
      <div className="text-gray-400 text-sm mb-2">
        Button callbacks are registered separately from the command. The{" "}
        <span className="font-mono">customId</span> must match between the
        button definition and the callback registration.
      </div>
      <h3 className="font-bold text-indigo-300 mb-2 mt-6 flex items-center gap-2">
        <FaEdit /> Editing & Deleting Messages from Button Callbacks
      </h3>
      <p className="mb-2 text-gray-300">
        In a button callback, you can edit or delete the message that contains
        the button using <span className="font-mono">ctx.getMessage()</span>:
      </p>
      {codeBlock(`bot.registerButtonCallback("buttonTest", "handler1", async (ctx) => {
  const msg = ctx.getMessage();
  await msg.edit("Button was clicked!");
  // or do more stuff
});`)}
      <div className="text-gray-400 text-sm mb-2">
        <span className="font-mono">ctx.getMessage()</span> returns a{" "}
        <span className="font-mono">BotMessage</span> object for the message
        containing the button.
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-bold text-indigo-200 mb-2 flex items-center gap-2">
        <FaBookOpen /> Full SDK API Reference
      </h2>
      <div className="bg-[#18191c] rounded-xl p-5 border border-[#23232a] shadow mb-4">
        <h3 className="font-bold text-indigo-300 mb-2">XelyraClient</h3>
        <ul className="list-disc ml-6 text-gray-300 text-base">
          <li>
            <span className="font-mono">
              constructor(options: &#123; token: string, gatewayUrl?: string
              &#125;)
            </span>
          </li>
          <li>
            <span className="font-mono">login()</span> — Connects to the gateway
          </li>
          <li>
            <span className="font-mono">on('ready', fn)</span> — Fired when
            connected
          </li>
          <li>
            <span className="font-mono">
              command(name, handler, options?, description?)
            </span>{" "}
            — Register a command
          </li>
          <li>
            <span className="font-mono">
              sendMessage(channelId, message, command, user, embeds?,buttons?)
            </span>{" "}
            — Send a message (returns{" "}
            <span className="font-mono">BotMessage</span>)
          </li>
          <li>
            <span className="font-mono">
              editMessage(messageId, content, embeds?,buttons?)
            </span>{" "}
            — Edit a message
          </li>
          <li>
            <span className="font-mono">deleteMessage(messageId)</span> — Delete
            a message
          </li>
        </ul>
      </div>
      <div className="bg-[#18191c] rounded-xl p-5 border border-[#23232a] shadow mb-4">
        <h3 className="font-bold text-indigo-300 mb-2">InteractionContext</h3>
        <ul className="list-disc ml-6 text-gray-300 text-base">
          <li>
            <span className="font-mono">command</span>,{" "}
            <span className="font-mono">userId</span>,{" "}
            <span className="font-mono">channelId</span>,{" "}
            <span className="font-mono">appId</span>,{" "}
            <span className="font-mono">botId</span>,{" "}
            <span className="font-mono">token</span>,{" "}
            <span className="font-mono">args</span>
          </li>
          <li>
            <span className="font-mono">respond(content, ephemeral?)</span> —
            Ephemeral reply
          </li>
          <li>
            <span className="font-mono">send(message, embeds?, buttons?)</span>{" "}
            — Send message (returns{" "}
            <span className="font-mono">BotMessage</span>)
          </li>
        </ul>
      </div>
      <div className="bg-[#18191c] rounded-xl p-5 border border-[#23232a] shadow mb-4">
        <h3 className="font-bold text-indigo-300 mb-2">BotMessage</h3>
        <ul className="list-disc ml-6 text-gray-300 text-base">
          <li>
            <span className="font-mono">
              edit(newContent, embeds?, buttons?)
            </span>{" "}
            — Edit message
          </li>
          <li>
            <span className="font-mono">delete()</span> — Delete message
          </li>
        </ul>
      </div>
      <div className="bg-[#18191c] rounded-xl p-5 border border-[#23232a] shadow mb-4">
        <h3 className="font-bold text-indigo-300 mb-2">Events</h3>
        <ul className="list-disc ml-6 text-gray-300 text-base">
          <li>
            <span className="font-mono">ready</span> — Fired when the bot is
            connected
          </li>
        </ul>
      </div>
      <div className="bg-[#18191c] rounded-xl p-5 border border-[#23232a] shadow mb-4">
        <h3 className="font-bold text-indigo-300 mb-2">Types</h3>
        <ul className="list-disc ml-6 text-gray-300 text-base">
          <li>
            <span className="font-mono">UUID</span> — string
          </li>
          <li>
            <span className="font-mono">Embed</span> — embed object
          </li>
          <li>
            <span className="font-mono">Button</span> — button object
          </li>
        </ul>
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-bold text-indigo-200 mb-2 flex items-center gap-2">
        <FaBookOpen /> Getting Your Application & Token
      </h2>
      <div className="flex flex-col items-center bg-[#18191c] rounded-xl p-6 border border-[#23232a] shadow mb-4">
        <img
          src={createAppGif}
          alt="Create app and token"
          className="rounded-lg shadow-lg w-full max-w-md mb-4 border border-indigo-700"
        />
        <div className="text-gray-300 text-center text-base">
          Create your application and copy your bot token from the Xelyra
          Developer Portal. Keep your token secret!
        </div>
      </div>
    </section>

    <div className="mt-10 text-gray-400 text-sm text-center">
      <p>
        For more details, advanced usage, and community support, see the full
        SDK documentation or ask in the Xelyra developer community!
      </p>
    </div>
  </div>
);

export default Documentation;
