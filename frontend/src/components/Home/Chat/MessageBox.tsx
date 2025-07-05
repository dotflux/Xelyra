import { useState, useEffect } from "react";
import editIcon from "../../../assets/edit.svg";
import deleteIcon from "../../../assets/trash.svg";
import axios from "axios";
import EditMessage from "./EditMessage";
import replyIcon from "../../../assets/reply.svg";

interface Sender {
  username: string;
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
}
const MessageBox = (props: Props) => {
  const [senderInfo, setSenderInfo] = useState<Sender | null>(null);
  const [editing, setEditing] = useState(false);
  const [repliedContent, setMsgRepliedContent] = useState<string | null>(null);

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
          className="relative flex items-stretch mt-1 mb-1 ml-7"
          style={{ minHeight: "20px" }}
        >
          {/* 90-degree SVG connector: down from avatar, then right to reply bar */}
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
              stroke="#5865f2"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <div className="flex-1 px-3 py-1 text-xs text-gray-400 bg-gray-700/30 rounded-lg border border-gray-600/30 mt-2">
            {(repliedContent || "").length > 60
              ? (repliedContent || "").slice(0, 60) + "…"
              : repliedContent || ""}
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
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
            {senderInfo?.username.charAt(0).toUpperCase() || "?"}
          </div>
        ) : (
          <div className="w-8 flex-none" />
        )}

        <div className="flex flex-col flex-1 min-w-0 relative">
          {!props.grouped && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white truncate">
                {senderInfo?.username || "Loading..."}
              </span>
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
                  {props.message}
                  {props.edited && (
                    <span className="text-gray-400 text-xs ml-1">(edited)</span>
                  )}
                </div>

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
                    }}
                  />

                  {/* Edit/Delete (only if user is the author) */}
                  {props.userId === props.user && (
                    <>
                      <img
                        src={editIcon}
                        alt="edit"
                        className="h-4 w-4 cursor-pointer hover:text-white opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => setEditing(true)}
                      />
                      <img
                        src={deleteIcon}
                        alt="delete"
                        className="h-4 w-4 cursor-pointer hover:text-red-500 opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => onDelete()}
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
