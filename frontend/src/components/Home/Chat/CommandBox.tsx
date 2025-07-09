import React, { useEffect, useState } from "react";
import axios from "axios";
import Embed from "./Embed";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CommandBoxProps {
  botName: string;
  botAvatar?: string; // optional, fallback to first letter
  command: string;
  message: string;
  createdAt: string;
  createdAtTimestamp: string;
  conversation: string;
  id: string;
  edited?: boolean;
  embeds?: string[] | object[];
}

interface CommandInfo {
  app_name: string;
  app_pfp: string;
  command_name: string;
  sender_username: string;
  sender_pfp?: string;
  sender_display_name?: string;
}

// Enhanced message formatting: supports bold, italic, inline code, and code blocks
function parseMessageFormatting(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  // Flexible code block regex: ```lang\s*\n?code\n?```
  const codeBlockRegex = /```([a-zA-Z0-9]*)[ \t]*\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(
        ...parseLinesWithHeadings(text.slice(lastIndex, match.index))
      );
    }
    const lang = match[1] || "text";
    const code = match[2];
    result.push(
      <SyntaxHighlighter
        key={match.index}
        language={lang}
        style={atomDark}
        customStyle={{
          borderRadius: "0.5rem",
          fontSize: "0.97em",
          margin: "0.5em 0",
          background: "#23232a",
          border: "1px solid #23232a",
          padding: "1.2em",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    );
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(...parseLinesWithHeadings(text.slice(lastIndex)));
  }
  return result;
}

function parseLinesWithHeadings(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^# (.+)/.test(line)) {
      const headingText = line.replace(/^# /, "");
      result.push(
        <div key={`heading-${i}`} className="font-bold text-xl mb-1">
          {headingText}
        </div>
      );
    } else {
      result.push(
        <div key={`line-${i}`} className="mb-0.5">
          {parseInlineFormatting(line)}
        </div>
      );
    }
  }
  return result;
}

function parseInlineFormatting(text: string): React.ReactNode[] {
  // Inline formatting: spoiler, code, underline, strikethrough, bold, italic
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex =
    /\|\|([^|]+)\|\||`([^`]+)`|__([^_]+)__|~~([^~]+)~~|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let match;
  let spoilerKey = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // Spoiler
      result.push(
        <Spoiler key={"spoiler-" + spoilerKey++}>{match[1]}</Spoiler>
      );
    } else if (match[2]) {
      // Inline code
      result.push(
        <code
          key={match.index}
          className="inline-code bg-[#23232a] text-[#e0e0e0] rounded px-2 py-0.5 mx-1 text-[0.97em]"
        >
          {match[2]}
        </code>
      );
    } else if (match[3]) {
      // Underline
      result.push(
        <span key={match.index} className="underline text-white">
          {match[3]}
        </span>
      );
    } else if (match[4]) {
      // Strikethrough
      result.push(
        <span
          key={match.index}
          className="line-through decoration-[0.13em] decoration-gray-400 text-white align-middle"
        >
          {match[4]}
        </span>
      );
    } else if (match[5]) {
      // Bold
      result.push(
        <span key={match.index} className="font-bold text-white">
          {match[5]}
        </span>
      );
    } else if (match[6]) {
      // Italic
      result.push(
        <span key={match.index} className="italic text-gray-300">
          {match[6]}
        </span>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

function parseMessage(message: string): React.ReactNode[] {
  // Split into lines and handle block-level formats
  const lines = message.split(/\r?\n/);
  return lines.map((line, idx) => {
    // Blockquote: '> ...' (allow leading spaces)
    if (/^\s*> /.test(line)) {
      return (
        <blockquote
          key={idx}
          className="border-l-4 border-white pl-3 ml-2 text-gray-300 italic py-1 rounded"
        >
          {parseInlineFormatting(line.replace(/^\s*> /, ""))}
        </blockquote>
      );
    }
    // Bullet point: '- ...' (allow leading spaces)
    if (/^\s*- /.test(line)) {
      return (
        <div key={idx} className="flex items-center gap-1">
          <span className="text-lg text-gray-200">•</span>
          <span>{parseInlineFormatting(line.replace(/^\s*- /, ""))}</span>
        </div>
      );
    }
    // Numbered list: '1. ...'
    const numberedListMatch = line.match(/^(\d+)\.\s(.*)$/);
    if (numberedListMatch) {
      return (
        <div key={idx} className="flex items-center gap-1">
          <span className="text-gray-200 font-semibold">
            {numberedListMatch[1] + "."}
          </span>
          <span>{parseInlineFormatting(numberedListMatch[2])}</span>
        </div>
      );
    }
    // Normal line
    return <span key={idx}>{parseInlineFormatting(line)}</span>;
  });
}

// Spoiler component
function Spoiler({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(true);
      }}
      className={`inline-block cursor-pointer transition-all px-2 py-1 rounded bg-black ${
        revealed ? "text-white" : "text-black select-none"
      }`}
      style={{
        background: revealed ? "#555" : "#08080a",
        color: revealed ? undefined : "transparent",
        boxShadow: revealed ? undefined : "0 0 0 1px #333",
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !revealed)
          setRevealed(true);
      }}
      aria-label={revealed ? undefined : "Spoiler: click to reveal"}
    >
      {children}
    </span>
  );
}

const CommandBox: React.FC<CommandBoxProps> = ({
  botName,
  botAvatar,
  command,
  message,
  createdAt,
  createdAtTimestamp,
  conversation,
  id,
  edited = false,
  embeds,
}) => {
  const [commandInfo, setCommandInfo] = useState<CommandInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(
          `http://localhost:3000/developer/commands/${id}/conversation/${conversation}/fetch/info`,
          {},
          { withCredentials: true }
        );
        if (res.data.valid) {
          setCommandInfo(res.data.commandInfo);
        } else {
          setError("Failed to fetch command info");
        }
      } catch (err) {
        setError("Failed to fetch command info");
      }
      setLoading(false);
    };
    fetchInfo();
  }, [id, conversation]);

  const msgDate = new Date(createdAtTimestamp);
  const time = msgDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={
        "group relative flex items-start gap-2 mt-3 hover:bg-gray-900 px-1"
      }
      style={{ lineHeight: "1.2" }}
    >
      {/* Stack reply badge+curve and bot info vertically */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Reply badge + curve in its own div, above the bot info/message div */}
        <div
          className="relative flex items-center ml-7 mt-2"
          style={{ height: "18px" }}
        >
          <svg
            width="24"
            height="18"
            viewBox="0 0 24 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-[-24px] top-0 z-10 pointer-events-none"
            style={{ height: "18px", width: "24px" }}
          >
            <path
              d="M12 18 V8 Q12 2 22 2 H24"
              stroke="#5865f2"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800/80 border border-blue-700 text-xs text-blue-200 font-mono shadow-sm"
            style={{
              lineHeight: "1.1",
              maxWidth: "220px",
              position: "relative",
              top: "-6px",
              marginLeft: "0.9rem",
            }}
          >
            {loading && <span>Loading…</span>}
            {error && <span className="text-red-400">{error}</span>}
            {commandInfo && (
              <>
                {commandInfo.sender_pfp ? (
                  <img
                    src={
                      commandInfo.sender_pfp.startsWith("/uploads/")
                        ? `http://localhost:3000${commandInfo.sender_pfp}`
                        : commandInfo.sender_pfp
                    }
                    alt={
                      commandInfo.sender_display_name ||
                      commandInfo.sender_username
                    }
                    className="w-5 h-5 rounded-full object-cover border border-blue-400 shadow mr-1"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center text-xs font-bold mr-1 select-none">
                    {(
                      commandInfo.sender_display_name ||
                      commandInfo.sender_username
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
                <span className="text-blue-300 font-semibold">
                  {commandInfo.sender_display_name ||
                    commandInfo.sender_username}
                </span>
                <span>used</span>
                <span className="bg-blue-900 text-blue-300 px-1 py-0.5 rounded font-bold">
                  /{commandInfo.command_name}
                </span>
              </>
            )}
          </div>
        </div>
        {/* Bot info (avatar, username/time/app, message) in its own div */}
        <div className="flex flex-row items-start gap-2 mt-1">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
            {commandInfo?.app_pfp ? (
              <img
                src={
                  commandInfo.app_pfp.startsWith("/uploads/")
                    ? `http://localhost:3000${commandInfo.app_pfp}`
                    : commandInfo.app_pfp
                }
                alt={commandInfo.app_name || botName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : botAvatar ? (
              <img
                src={botAvatar}
                alt={botName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              (commandInfo?.app_name || botName).charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0 relative">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-blue-400 truncate">
                {commandInfo?.app_name || botName}
              </span>
              <span className="bg-blue-700 text-xs text-white px-2 py-0.5 rounded ml-1 font-bold tracking-wide">
                BOT
              </span>
              <span className="text-xs text-gray-400">{time}</span>
              {edited && (
                <span className="text-xs italic text-gray-400 ml-1">
                  (edited)
                </span>
              )}
            </div>
            {/* The actual message content, if any */}
            {message && (
              <div className="max-w-[75%] text-sm text-blue-100 whitespace-pre-wrap break-words mt-1">
                {parseMessage(message)}
              </div>
            )}
            {/* Embeds */}
            {Array.isArray(embeds) && embeds.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {embeds.map((embed: string | object, idx: number) => {
                  let parsed: any = embed;
                  if (typeof embed === "string") {
                    try {
                      parsed = JSON.parse(embed);
                    } catch {
                      return null;
                    }
                  }
                  if (!parsed || typeof parsed !== "object") return null;
                  return <Embed key={idx} {...parsed} />;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandBox;
