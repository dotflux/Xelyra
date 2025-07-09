import { useState, useEffect, useRef } from "react";
import editIcon from "../../../assets/edit.svg";
import deleteIcon from "../../../assets/trash.svg";
import axios from "axios";
import EditMessage from "./EditMessage";
import replyIcon from "../../../assets/reply.svg";
import Embed from "./Embed";
import UserPopup from "./UserPopup";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Sender {
  username: string;
  type: string;
  displayName: string;
  pfp?: string;
}

interface Props {
  user: string;
  id: string;
  message: string;
  createdAt: string;
  createdAtTimestamp: string;
  grouped: boolean;
  edited: boolean;
  conversation: string;
  userId: string;
  setRepliedTo: React.Dispatch<React.SetStateAction<string | null>>;
  setRepliedContent: React.Dispatch<React.SetStateAction<string>>;
  repliedTo: string | null;
  files?: any[];
  setRepliedSenderType?: React.Dispatch<React.SetStateAction<string | null>>;
  embeds?: string[] | object[];
}

const BACKEND_URL = "http://localhost:3000";

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

function parseFullMessage(message: string): React.ReactNode[] {
  // Split into code blocks and non-code blocks
  const codeBlockRegex = /```([a-zA-Z0-9]*)[ \t]*\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let result: React.ReactNode[] = [];
  let blockIdx = 0;
  while ((match = codeBlockRegex.exec(message)) !== null) {
    if (match.index > lastIndex) {
      // Handle non-code block segment
      result = result.concat(
        parseBlockLines(message.slice(lastIndex, match.index), blockIdx)
      );
      blockIdx++;
    }
    // Handle code block
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

function parseBlockLines(text: string, blockIdx: number): React.ReactNode[] {
  // Split into lines and handle block-level formats
  const lines = text.split(/\r?\n/);
  const result: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Heading: '# ...'
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
      // Insert vertical gap if next line is empty
      if (lines[i + 1] !== undefined && /^\s*$/.test(lines[i + 1])) {
        result.push(
          <div
            key={`empty-after-heading-${blockIdx}-${i}`}
            style={{ height: "0.5em" }}
          />
        );
      }
      continue;
    }
    // Blockquote: '> ...' (allow leading spaces)
    if (/^\s*> /.test(line)) {
      const content = line.replace(/^\s*> /, "");
      result.push(
        <blockquote
          key={`bq-${blockIdx}-${i}`}
          className="border-l-4 border-white pl-3 ml-2 text-gray-300 italic py-1 rounded"
        >
          {parseInlineFormatting(content)}
        </blockquote>
      );
      // Insert vertical gap if next line is empty or if content is empty
      if (
        content.trim() === "" ||
        (lines[i + 1] !== undefined && /^\s*$/.test(lines[i + 1]))
      ) {
        result.push(
          <div
            key={`empty-after-bq-${blockIdx}-${i}`}
            style={{ height: "0.5em" }}
          />
        );
      }
      continue;
    }
    // Bullet point: '- ...' (allow leading spaces)
    if (/^\s*- /.test(line)) {
      const content = line.replace(/^\s*- /, "");
      result.push(
        <div
          key={`bullet-${blockIdx}-${i}`}
          className="flex items-center gap-1"
        >
          <span className="text-lg text-gray-200">•</span>
          <span>{parseInlineFormatting(content)}</span>
        </div>
      );
      if (
        content.trim() === "" ||
        (lines[i + 1] !== undefined && /^\s*$/.test(lines[i + 1]))
      ) {
        result.push(
          <div
            key={`empty-after-bullet-${blockIdx}-${i}`}
            style={{ height: "0.5em" }}
          />
        );
      }
      continue;
    }
    // Numbered list: '1. ...'
    const numberedListMatch = line.match(/^(\d+)\.\s(.*)$/);
    if (numberedListMatch) {
      const content = numberedListMatch[2];
      result.push(
        <div
          key={`numlist-${blockIdx}-${i}`}
          className="flex items-center gap-1"
        >
          <span className="text-gray-200 font-semibold">
            {numberedListMatch[1] + "."}
          </span>
          <span>{parseInlineFormatting(content)}</span>
        </div>
      );
      if (
        content.trim() === "" ||
        (lines[i + 1] !== undefined && /^\s*$/.test(lines[i + 1]))
      ) {
        result.push(
          <div
            key={`empty-after-numlist-${blockIdx}-${i}`}
            style={{ height: "0.5em" }}
          />
        );
      }
      continue;
    }
    // Preserve empty lines as vertical space
    if (/^\s*$/.test(line)) {
      result.push(
        <div key={`empty-${blockIdx}-${i}`} style={{ height: "0.5em" }} />
      );
      continue;
    }
    // Normal line (render as <div> for line break)
    result.push(
      <div key={`line-${blockIdx}-${i}`}>{parseInlineFormatting(line)}</div>
    );
  }
  return result;
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

const MessageBox = (props: Props) => {
  const [senderInfo, setSenderInfo] = useState<Sender | null>(null);
  const [editing, setEditing] = useState(false);
  const [repliedContent, setMsgRepliedContent] = useState<string | null>(null);
  const [repliedUsername, setRepliedUsername] = useState<string | null>(null);
  const [repliedPfp, setRepliedPfp] = useState<string | null>(null);
  const [repliedDisplayName, setRepliedDisplayName] = useState<string | null>(
    null
  );
  const [imageDims, setImageDims] = useState<{
    [key: number]: { width: number; height: number };
  }>({});
  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const [userPopupData, setUserPopupData] = useState<any | null>(null);
  const pfpRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  const fetchSender = async () => {
    try {
      if (!props.user) return;
      const response = await axios.post(
        "http://localhost:3000/home/senderInfo",
        { sender: props.user, replyTo: props.repliedTo },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setSenderInfo(response.data.senderData);
        setMsgRepliedContent(response.data.repliedContent);
        setRepliedUsername(response.data.repliedUsername);
        setRepliedPfp(response.data.repliedPfp);
        setRepliedDisplayName(response.data.repliedDisplayName);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  useEffect(() => {
    fetchSender();
  }, [props.user, props.repliedTo]);

  const onDelete = async () => {
    try {
      if (!props.id && !props.conversation) return;
      await axios.post(
        "http://localhost:3000/home/messages/delete",
        { conversation: props.conversation, message: props.id },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  const msgDate = new Date(props.createdAtTimestamp);
  const now = new Date();

  // Build "Today / Yesterday / MM/DD/YYYY" prefix
  let dayLabel: string;
  if (msgDate.toDateString() === now.toDateString()) {
    dayLabel = "";
  } else {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
      dayLabel = "Yesterday at";
    } else {
      const m = msgDate.getMonth() + 1;
      const d = msgDate.getDate();
      const y = msgDate.getFullYear();
      dayLabel = `${m}/${d}/${y} at`;
    }
  }

  // Format time as before
  const time = msgDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePfpClick = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/home/popupInfo",
        { userToFetch: props.user },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.valid) {
        setUserPopupData(response.data.senderData);
        setUserPopupOpen(true);
      }
    } catch (error) {
      // Optionally show error
    }
  };

  return (
    <>
      {/* User Info Popup */}
      <UserPopup
        open={userPopupOpen}
        onClose={() => setUserPopupOpen(false)}
        senderData={userPopupData || {}}
        anchorRef={pfpRef}
      />
      {/* Discord-style reply bar and connector above the username/timestamp */}
      {props.repliedTo && repliedContent && !props.grouped && (
        <div
          className="relative flex items-stretch mt-4 mb-1 ml-7"
          style={{ minHeight: "20px" }}
        >
          <svg
            width="32"
            height="20"
            viewBox="0 0 32 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-[-32px] bottom-0 z-10 pointer-events-none"
            style={{ height: "18px", width: "32px" }}
          >
            <path
              d="M16 20 V10 Q16 2 28 2 H32"
              stroke="#818cf8"
              strokeWidth="2"
              fill="none"
              className="drop-shadow-glow"
            />
          </svg>
          <div className="flex items-center gap-2 flex-1 pl-2 border-l-2 border-indigo-400/60">
            {repliedPfp ? (
              <img
                src={
                  repliedPfp.startsWith("/uploads/")
                    ? `${BACKEND_URL}${repliedPfp}`
                    : repliedPfp
                }
                alt={repliedDisplayName || repliedUsername || "User"}
                className="w-6 h-6 rounded-full object-cover border border-indigo-400/40 shadow"
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-white shadow">
                {(repliedDisplayName || repliedUsername || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <span
              className="text-xs font-semibold text-indigo-300 truncate max-w-[100px]"
              title={repliedDisplayName || repliedUsername || undefined}
            >
              {repliedDisplayName || repliedUsername || "User"}
            </span>
            <span
              className="text-xs text-indigo-200 italic opacity-90 flex-1 min-w-0 truncate"
              title={repliedContent || undefined}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {repliedContent || ""}
            </span>
          </div>
        </div>
      )}
      <div
        className={`group relative flex items-start gap-2 ${
          props.grouped ? "mt-[1px] ml-[8px]" : "mt-3"
        } hover:bg-gray-900/70 px-1 transition-colors duration-150`}
        style={{ lineHeight: "1.2" }}
      >
        {/* Action bar on hover */}
        <div className="absolute right-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-1 bg-black/60 backdrop-blur-md rounded-xl shadow-lg p-1 border border-gray-800">
          <button
            className="p-1 hover:bg-indigo-700/70 rounded-lg transition-colors"
            title="Reply"
            onClick={() => {
              props.setRepliedTo(props.id);
              props.setRepliedContent(props.message);
              if (props.setRepliedSenderType)
                props.setRepliedSenderType(senderInfo?.type || null);
            }}
          >
            <img src={replyIcon} alt="Reply" className="w-5 h-5" />
          </button>
          {props.userId === props.user && (
            <>
              <button
                className="p-1 hover:bg-indigo-700/70 rounded-lg transition-colors"
                title="Edit"
                onClick={() => setEditing(true)}
              >
                <img src={editIcon} alt="Edit" className="w-5 h-5" />
              </button>
              <button
                className="p-1 hover:bg-red-700/70 rounded-lg transition-colors"
                title="Delete"
                onClick={onDelete}
              >
                <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        {!props.grouped ? (
          senderInfo?.pfp ? (
            <div
              ref={pfpRef}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center cursor-pointer border-2 border-indigo-700/40 shadow"
              onClick={handlePfpClick}
              title={senderInfo?.username || "User"}
            >
              <img
                src={
                  senderInfo.pfp.startsWith("/uploads/")
                    ? `${BACKEND_URL}${senderInfo.pfp}`
                    : senderInfo.pfp
                }
                alt={senderInfo.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          ) : (
            <div
              ref={pfpRef}
              className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md"
            >
              {senderInfo?.username.charAt(0).toUpperCase() || "?"}
            </div>
          )
        ) : (
          <div className="w-8 flex-none" />
        )}

        <div className="flex flex-col flex-1 min-w-0 relative">
          {!props.grouped && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white truncate">
                {senderInfo?.displayName
                  ? senderInfo.displayName
                  : senderInfo?.username || "Loading..."}
              </span>
              {senderInfo?.type === "bot" && (
                <span className="bg-blue-700 text-xs text-white px-2 py-0.5 rounded ml-1 font-bold tracking-wide">
                  BOT
                </span>
              )}
              {senderInfo?.type === "ai" && (
                <span className="bg-green-700 text-xs text-white px-2 py-0.5 rounded ml-1 font-bold tracking-wide">
                  AI
                </span>
              )}
              <span className="text-xs text-gray-400">
                {dayLabel} {time}
              </span>
            </div>
          )}

          {/* message + icon wrapper */}
          <div className="relative w-full">
            {editing ? (
              <EditMessage
                channelId={props.conversation}
                initialText={props.message}
                messageId={props.id}
                onCancel={() => setEditing(false)}
                onEdited={() => setEditing(false)}
              />
            ) : (
              <>
                <div className="max-w-full sm:max-w-[75%] text-sm text-gray-200 whitespace-pre-wrap break-words overflow-x-hidden">
                  {parseFullMessage(props.message)}
                  {props.edited && (
                    <span className="text-gray-400 text-xs ml-1">(edited)</span>
                  )}
                </div>
                {/* File attachments */}
                {Array.isArray(props.files) && props.files.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {props.files.map((file: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        {file.type.startsWith("image/") ? (
                          <a
                            href={`${BACKEND_URL}${file.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={`${BACKEND_URL}${file.url}`}
                              alt={file.filename}
                              className="rounded shadow border border-gray-700 w-full max-w-[600px] h-auto max-h-[400px]"
                              style={{ display: "block" }}
                              onLoad={(e) => {
                                const img = e.currentTarget;
                                setImageDims((dims) => ({
                                  ...dims,
                                  [idx]: {
                                    width: img.naturalWidth,
                                    height: img.naturalHeight,
                                  },
                                }));
                              }}
                            />
                            <span className="ml-2 text-xs text-gray-400">
                              {imageDims[idx]
                                ? `${imageDims[idx].width}×${imageDims[idx].height}px, `
                                : ""}
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </a>
                        ) : (
                          <div className="flex items-center bg-gray-800/80 px-4 py-2 rounded-lg border border-gray-700 shadow max-w-[400px]">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-100 font-semibold truncate">
                                {file.originalname || file.filename}
                              </div>
                              <div className="text-xs text-gray-400">
                                {(file.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                            <a
                              href={`${BACKEND_URL}${file.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 flex items-center px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs rounded transition-colors duration-150 font-bold"
                              download
                              title="Download file"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                />
                              </svg>
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Embeds */}
                {Array.isArray((props as any).embeds) &&
                  (props as any).embeds.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      {(props as any).embeds.map(
                        (embed: string | object, idx: number) => {
                          let parsed: any = embed;
                          if (typeof embed === "string") {
                            try {
                              parsed = JSON.parse(embed);
                            } catch {
                              return null;
                            }
                          }
                          if (!parsed || typeof parsed !== "object")
                            return null;
                          return <Embed key={idx} {...parsed} />;
                        }
                      )}
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageBox;
