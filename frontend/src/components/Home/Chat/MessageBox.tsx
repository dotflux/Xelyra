import { useState, useEffect, useRef } from "react";
import editIcon from "../../../assets/edit.svg";
import deleteIcon from "../../../assets/trash.svg";
import axios from "axios";
import EditMessage from "./EditMessage";
import replyIcon from "../../../assets/reply.svg";
import React from "react";
import Embed from "./Embed";
import UserPopup from "./UserPopup";

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

// Add a function to parse *italic* and **bold**
function parseMessageFormatting(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // Bold
      result.push(
        <span key={match.index} className="font-bold text-white">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      // Italic
      result.push(
        <span key={match.index} className="italic text-gray-300">
          {match[2]}
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

const MessageBox = (props: Props) => {
  const [senderInfo, setSenderInfo] = useState<Sender | null>(null);
  const [editing, setEditing] = useState(false);
  const [repliedContent, setMsgRepliedContent] = useState<string | null>(null);
  const [repliedUsername, setRepliedUsername] = useState<string | null>(null);
  const [repliedPfp, setRepliedPfp] = useState<string | null>(null);
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
                alt={repliedUsername || "User"}
                className="w-6 h-6 rounded-full object-cover border border-indigo-400/40 shadow"
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-white shadow">
                {(repliedUsername || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="text-xs font-semibold text-indigo-300 truncate max-w-[100px]"
              title={repliedUsername || undefined}
            >
              {repliedUsername || "User"}
            </span>
            <span
              className="text-xs text-indigo-200 italic opacity-90 flex-1 min-w-0 truncate"
              title={repliedContent || undefined}
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
        {!props.grouped && (
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
        )}
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
                  {parseMessageFormatting(props.message)}
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
