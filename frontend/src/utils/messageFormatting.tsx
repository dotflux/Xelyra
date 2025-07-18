import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function parseMessageFormatting(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
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

export function parseLinesWithHeadings(text: string): React.ReactNode[] {
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

export function parseInlineFormatting(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  const urlRegex =
    /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?![^<]*>|[^&];)/g;
  const regex =
    /\|\|([^|]+)\|\||`([^`]+)`|__([^_]+)__|~~([^~]+)~~|\*\*([^*]+)\*\*|\*([^*]+)\*|https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+(?![^<]*>|[^&];)/g;
  let match;
  let spoilerKey = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      result.push(
        <Spoiler key={"spoiler-" + spoilerKey++}>{match[1]}</Spoiler>
      );
    } else if (match[2]) {
      result.push(
        <code
          key={match.index}
          className="inline-code bg-[#23232a] text-[#e0e0e0] rounded px-2 py-0.5 mx-1 text-[0.97em]"
        >
          {match[2]}
        </code>
      );
    } else if (match[3]) {
      result.push(
        <span key={match.index} className="underline text-white">
          {match[3]}
        </span>
      );
    } else if (match[4]) {
      result.push(
        <span
          key={match.index}
          className="line-through decoration-[0.13em] decoration-gray-400 text-white align-middle"
        >
          {match[4]}
        </span>
      );
    } else if (match[5]) {
      result.push(
        <span key={match.index} className="font-bold text-white">
          {match[5]}
        </span>
      );
    } else if (match[6]) {
      result.push(
        <span key={match.index} className="italic text-gray-300">
          {match[6]}
        </span>
      );
    } else if (match[0] && urlRegex.test(match[0])) {
      result.push(
        <a
          key={match.index}
          href={match[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          {match[0]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

export function parseMessage(message: string): React.ReactNode[] {
  const lines = message.split(/\r?\n/);
  return lines.map((line, idx) => {
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
    if (/^\s*- /.test(line)) {
      return (
        <div key={idx} className="flex items-center gap-1">
          <span className="text-lg text-gray-200">•</span>
          <span>{parseInlineFormatting(line.replace(/^\s*- /, ""))}</span>
        </div>
      );
    }
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
    return <span key={idx}>{parseInlineFormatting(line)}</span>;
  });
}

export function parseFullMessage(message: string): React.ReactNode[] {
  const codeBlockRegex = /```([a-zA-Z0-9]*)[ \t]*\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let result: React.ReactNode[] = [];
  let blockIdx = 0;
  while ((match = codeBlockRegex.exec(message)) !== null) {
    if (match.index > lastIndex) {
      result = result.concat(
        parseBlockLines(message.slice(lastIndex, match.index), blockIdx)
      );
      blockIdx++;
    }
    const lang = match[1] || "text";
    const code = match[2];
    result.push(
      <SyntaxHighlighter
        key={`codeblock-${blockIdx}`}
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
    blockIdx++;
  }
  if (lastIndex < message.length) {
    result = result.concat(parseBlockLines(message.slice(lastIndex), blockIdx));
  }
  return result;
}

export function parseBlockLines(
  text: string,
  blockIdx: number
): React.ReactNode[] {
  const lines = text.split(/\r?\n/);
  const result: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (/^# (.+)/.test(line)) {
      const headingText = line.replace(/^# /, "");
      result.push(
        <div
          key={`heading-${blockIdx}-${i}`}
          className="font-bold text-xl mb-1"
        >
          {headingText}
        </div>
      );
      if (lines[i + 1] !== undefined && /^\s*$/.test(lines[i + 1])) {
        result.push(
          <div key={`empty-after-heading-${blockIdx}-${i}`} className="h-0.5" />
        );
      }
      continue;
    }
    if (/^\s*- /.test(line)) {
      result.push(
        <div
          key={`bullet-${blockIdx}-${i}`}
          className="flex items-center gap-1"
        >
          <span className="text-lg text-gray-200">•</span>
          <span>{parseInlineFormatting(line.replace(/^\s*- /, ""))}</span>
        </div>
      );
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const numberedListMatch = line.match(/^(\d+)\.\s(.*)$/);
      if (numberedListMatch) {
        result.push(
          <div
            key={`numlist-${blockIdx}-${i}`}
            className="flex items-center gap-1"
          >
            <span className="text-gray-200 font-semibold">
              {numberedListMatch[1] + "."}
            </span>
            <span>{parseInlineFormatting(numberedListMatch[2])}</span>
          </div>
        );
      }
      continue;
    }
    result.push(
      <div key={`line-${blockIdx}-${i}`} className="mb-0.5">
        {parseInlineFormatting(line)}
      </div>
    );
  }
  return result;
}

export function Spoiler({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = React.useState(false);
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
