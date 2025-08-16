import React, { useEffect, useState } from "react";
import axios from "axios";
import Embed from "./Embed";
import { parseMessageFormatting } from "../../../utils/messageFormatting";
import CommandAvatar from "./Message/CommandAvatar";
import { io, Socket } from "socket.io-client";
import { useUser } from "../UserContext";
import TimestampLabel from "./Message/TimestampLabel";

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
  buttons?: string[] | object[];
  app_id: string;
}

interface CommandInfo {
  app_name: string;
  app_pfp: string;
  app_id: string;
  bot_id: string;
  command_name: string;
  sender_username: string;
  sender_pfp?: string;
  sender_display_name?: string;
}

const CommandBox: React.FC<CommandBoxProps> = ({
  botName,
  botAvatar,
  message,
  createdAtTimestamp,
  conversation,
  id,
  edited = false,
  embeds,
  buttons,
}) => {
  const [commandInfo, setCommandInfo] = useState<CommandInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);

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

  useEffect(() => {
    const s = io("http://localhost:3000/bots-interactions", {
      withCredentials: true,
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  const msgDate = new Date(createdAtTimestamp);
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
          <CommandAvatar
            botAvatar={commandInfo?.app_pfp || botAvatar}
            botName={commandInfo?.app_name || botName}
          />
          <div className="flex flex-col flex-1 min-w-0 relative">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-blue-400 truncate">
                {commandInfo?.app_name || botName}
              </span>
              <span className="bg-blue-700 text-xs text-white px-2 py-0.5 rounded ml-1 font-bold tracking-wide">
                BOT
              </span>
              <TimestampLabel dayLabel={dayLabel} time={time} />
              {edited && (
                <span className="text-xs italic text-gray-400 ml-1">
                  (edited)
                </span>
              )}
            </div>
            {/* The actual message content, if any */}
            {message && (
              <div className="max-w-[75%] text-sm text-blue-100 whitespace-pre-wrap break-words mt-1">
                {parseMessageFormatting(message)}
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
            {Array.isArray(buttons) && buttons.length > 0 && (
              <div className="mt-2 flex flex-row gap-2">
                {buttons.map((btn: string | object, idx: number) => {
                  let parsed: any = btn;
                  if (typeof btn === "string") {
                    try {
                      parsed = JSON.parse(btn);
                    } catch {
                      return null;
                    }
                  }
                  if (!parsed || typeof parsed !== "object") return null;
                  let colorClass = "bg-gray-700 text-white";
                  if (parsed.color === "primary")
                    colorClass = "bg-indigo-600 hover:bg-indigo-700 text-white";
                  if (parsed.color === "secondary")
                    colorClass = "bg-gray-600 hover:bg-gray-700 text-white";
                  if (parsed.color === "success")
                    colorClass = "bg-green-600 hover:bg-green-700 text-white";
                  if (parsed.color === "danger")
                    colorClass = "bg-red-600 hover:bg-red-700 text-white";
                  return (
                    <button
                      key={parsed.customId || idx}
                      className={`px-4 py-1 rounded font-semibold text-sm transition ${colorClass}`}
                      style={{ minWidth: 80 }}
                      onClick={() => {
                        if (
                          !socket ||
                          !parsed.customId ||
                          !commandInfo ||
                          !user
                        )
                          return;
                        socket.emit("buttonInteraction", {
                          customId: parsed.customId,
                          appId: commandInfo.app_id,
                          botId: commandInfo.bot_id,
                          command: commandInfo.command_name,
                          channelId: conversation,
                          userId: user.id,
                          messageId: id,
                        });
                      }}
                    >
                      {parsed.name}
                    </button>
                  );
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
