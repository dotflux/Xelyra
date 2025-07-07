import { useState, useEffect } from "react";
import editIcon from "../../../assets/edit.svg";
import deleteIcon from "../../../assets/trash.svg";
import axios from "axios";
import EditMessage from "./EditMessage";
import replyIcon from "../../../assets/reply.svg";
import React from "react";

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

  return (
    <>
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
              className="text-xs text-indigo-200 truncate max-w-[180px] italic opacity-90"
              title={repliedContent || undefined}
            >
              {(repliedContent || "").length > 60
                ? (repliedContent || "").slice(0, 60) + "…"
                : repliedContent || ""}
            </span>
          </div>
        </div>
      )}
      <div
        className={`group relative flex items-start gap-2 ${
          props.grouped ? "mt-[1px] ml-[8px]" : "mt-3"
        } hover:bg-gray-900 px-1`}
        style={{ lineHeight: "1.2" }}
      >
        {!props.grouped ? (
          senderInfo?.pfp ? (
            <img
              src={
                senderInfo.pfp.startsWith("/uploads/")
                  ? `${BACKEND_URL}${senderInfo.pfp}`
                  : senderInfo.pfp
              }
              alt={senderInfo.displayName || senderInfo.username}
              className="h-10 w-10 rounded-full object-cover bg-gray-700 border border-gray-800 shadow-md"
            />
          ) : (
            <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
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
                <div className="max-w-[75%] text-sm text-gray-200 whitespace-pre-wrap break-words">
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
                              className="rounded shadow border border-gray-700 max-w-[600px] max-h-[400px] w-auto h-auto"
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

                {/* icon container */}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex space-x-2 transition-all duration-200">
                  {/* Reply icon (always visible on hover) */}
                  <img
                    src={replyIcon}
                    alt="reply"
                    className="h-4 w-4 cursor-pointer hover:text-white opacity-70 hover:opacity-100 transition-opacity"
                    onClick={() => {
                      props.setRepliedTo(props.createdAt);
                      props.setRepliedContent(props.message);
                      if (props.setRepliedSenderType) {
                        props.setRepliedSenderType(senderInfo?.type || null);
                      }
                    }}
                    title="Reply"
                  />

                  {/* Edit/Delete (only if user is the author) */}
                  {props.userId === props.user && (
                    <>
                      <img
                        src={editIcon}
                        alt="edit"
                        className="h-4 w-4 cursor-pointer hover:text-white opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => setEditing(true)}
                        title="Edit"
                      />
                      <img
                        src={deleteIcon}
                        alt="delete"
                        className="h-4 w-4 cursor-pointer hover:text-red-500 opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => onDelete()}
                        title="Delete"
                      />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageBox;
