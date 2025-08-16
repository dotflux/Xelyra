import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import TopBar from "./TopBar";
import Typer from "./Typer";
import MessageBox from "./MessageBox";
import GroupPanel from "./Group/GroupPanel";
import CommandBox from "./CommandBox";
import MembersPanel from "./MembersPanel";

interface Message {
  user: string;
  message: string;
  conversation: string;
  is_read: boolean;
  id: string;
  created_at: string | null;
  created_timestamp: string | null;
  created_ts?: number | null;
  edited: boolean;
  reply_to: string | null;
  command?: string;
  bot_id?: string;
  app_id?: string;
  files?: string[];
  embeds?: string[];
  buttons?: string[];
}

interface Props {
  id: string;
}

const ChatWindow = (props: Props) => {
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const channel = searchParams.get("channel");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [repliedContent, setRepliedContent] = useState("");
  const [repliedSenderType, setRepliedSenderType] = useState<string | null>(
    null
  );
  const [showPanel, setShowPanel] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [channelInfo, setChannelInfo] = useState<{
    name: string;
    type: string;
  } | null>(null);

  const normalizeRows = (rows: any[] = []): Message[] => {
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map((r: any) => {
      const created_ts =
        typeof r.created_timestamp === "number"
          ? r.created_timestamp
          : r.created_timestamp instanceof Date
          ? r.created_timestamp.getTime()
          : typeof r.created_timestamp === "string"
          ? Number.isNaN(Date.parse(r.created_timestamp))
            ? null
            : Date.parse(r.created_timestamp)
          : null;
      return {
        ...r,
        created_timestamp: r.created_timestamp ?? null,
        created_at: r.created_at ? String(r.created_at) : null,
        created_ts,
        reply_to: r.reply_to ? String(r.reply_to) : null,
        files: r.files || [],
      } as Message;
    });
  };

  const fetchMessages = async (
    cursors?: { userCursor?: string; commandCursor?: string },
    limit: number = cursors ? 70 : 40
  ) => {
    if (!channel) return;
    setLoadingMore(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/home/messages",
        {
          conversation: channel,
          userCursor: cursors?.userCursor,
          commandCursor: cursors?.commandCursor,
          limit,
        },
        { withCredentials: true }
      );
      if (!response.data.valid) {
        setLoadingMore(false);
        return;
      }
      const msgs = normalizeRows(response.data.messages || []);
      const cmds = normalizeRows(response.data.commands || []);
      const allMessages = [...msgs, ...cmds].sort((a, b) => {
        const A = a.created_ts ?? 0;
        const B = b.created_ts ?? 0;
        return A - B;
      });
      setHasMore(
        (Array.isArray(response.data.messages) &&
          response.data.messages.length === limit) ||
          (Array.isArray(response.data.commands) &&
            response.data.commands.length === limit)
      );
      if (cursors) {
        if (messagesContainerRef.current) {
          const prevScrollHeight = messagesContainerRef.current.scrollHeight;
          const prevScrollTop = messagesContainerRef.current.scrollTop;
          setMessages((prev) => [...allMessages, ...prev]);
          setTimeout(() => {
            if (!messagesContainerRef.current) return;
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop =
              newScrollHeight - prevScrollHeight + prevScrollTop;
          }, 0);
        } else {
          setMessages((prev) => [...allMessages, ...prev]);
        }
      } else {
        setMessages(allMessages);
        setInitialLoad(true);
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [channel]);

  useEffect(() => {
    if (!channel) return;
    socketRef.current = io("http://localhost:3000/messages", {
      withCredentials: true,
    });
    socketRef.current.emit("joinConversation", channel);
    socketRef.current.on("newMessage", (msg: Message) => {
      const normalized = normalizeRows([msg])[0];
      setMessages((prev) => [...prev, normalized]);
    });
    socketRef.current.on("messageEdited", ({ messageId, message, edited }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, message, edited } : m))
      );
    });
    socketRef.current.on(
      "commandEdited",
      ({ messageId, message, edited, embeds, buttons }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  message,
                  edited,
                  embeds: embeds ?? m.embeds,
                  buttons: buttons ?? m.buttons,
                }
              : m
          )
        );
      }
    );
    socketRef.current.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });
    socketRef.current.on("commandDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [channel]);

  useEffect(() => {
    if (!initialLoad) return;
    if (!messages || messages.length === 0) {
      setInitialLoad(false);
      return;
    }
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
      setInitialLoad(false);
      return;
    }
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ block: "end" });
      setInitialLoad(false);
    }, 0);
  }, [messages, initialLoad]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const current = target.scrollTop;

    const isScrollingUp = current < lastScrollTopRef.current;
    lastScrollTopRef.current = current;
    if (!isScrollingUp) return;

    if (!(current < 100 && hasMore && !loadingMore)) return;

    if (!messages || messages.length === 0) {
      setHasMore(false);
      return;
    }

    const oldestUser = messages.find((m) => !m.command);
    const oldestCommand = messages.find((m) => m.command);
    const userCursor = oldestUser?.created_at ?? null;
    const commandCursor = oldestCommand?.created_at ?? null;

    if (!userCursor && !commandCursor) {
      setHasMore(false);
      return;
    }

    fetchMessages(
      {
        userCursor: userCursor ?? undefined,
        commandCursor: commandCursor ?? undefined,
      },
      10
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#121316]">
      <TopBar
        showPanel={showPanel}
        setShowPanel={setShowPanel}
        onChannelInfoChange={setChannelInfo}
        socket={socketRef.current}
      />
      <div
        className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {!channel ? (
          <div className="flex flex-col items-center justify-center h-full text-center select-none">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-16 w-16 text-indigo-400 opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20h.01M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-indigo-300 mb-2">
              No Channel Selected
            </div>
            <div className="text-gray-400 text-base max-w-md mx-auto">
              Please select a channel from the left sidebar to start chatting.
              <br />
              Channels are where conversations happen in your server!
            </div>
          </div>
        ) : loadingMore ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        ) : messages?.length ? (
          messages.map((msg, i) => {
            const prev = messages[i - 1];
            const sameSender = !!prev && prev.user === msg.user;
            const sameMinute =
              !!prev &&
              Math.abs((msg.created_ts ?? 0) - (prev.created_ts ?? 0)) < 60_000;
            const isReply = !!msg.reply_to && msg.reply_to.trim() !== "";
            const prevIsCommand = !!prev && !!prev.command;
            const currentIsCommand = !!msg.command;
            const grouped =
              sameSender &&
              sameMinute &&
              !isReply &&
              !prevIsCommand &&
              !currentIsCommand;
            if (msg.command) {
              return (
                <CommandBox
                  key={i}
                  botName={msg.bot_id ? msg.bot_id : "Bot"}
                  command={msg.command}
                  message={msg.message}
                  createdAt={msg.created_at ?? ""}
                  createdAtTimestamp={msg.created_timestamp ?? ""}
                  conversation={msg.conversation}
                  id={msg.id}
                  edited={msg.edited}
                  embeds={msg.embeds}
                  buttons={msg.buttons}
                  app_id={msg.app_id || ""}
                />
              );
            }
            return (
              <MessageBox
                key={i}
                user={msg.user}
                id={msg.id}
                message={msg.message}
                createdAtTimestamp={msg.created_timestamp ?? ""}
                createdAt={msg.created_at ?? ""}
                grouped={grouped}
                edited={msg.edited}
                conversation={msg.conversation}
                userId={props.id}
                setRepliedTo={setReplyTo}
                setRepliedContent={setRepliedContent}
                repliedTo={msg.reply_to}
                files={msg.files}
                setRepliedSenderType={setRepliedSenderType}
                embeds={msg.embeds}
              />
            );
          })
        ) : (
          <div className="text-center mt-16">
            <div className="text-gray-500 text-lg font-medium">
              No messages yet
            </div>
            <div className="text-gray-600 text-sm mt-2">
              Start a conversation!
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-[#2a2b2e] bg-[#191a1d]">
        <Typer
          channelId={channel}
          replyTo={replyTo}
          repliedContent={repliedContent}
          setReplyTo={setReplyTo}
          setRepliedContent={setRepliedContent}
          repliedSenderType={repliedSenderType}
          channelName={channelInfo?.name}
          channelType={channelInfo?.type}
        />
      </div>
      {showPanel &&
        (channelInfo?.type === "group" ? (
          <GroupPanel
            showPanel={showPanel}
            onClose={() => setShowPanel(false)}
            channel={channel}
          />
        ) : (
          <MembersPanel
            showPanel={showPanel}
            onClose={() => setShowPanel(false)}
            channel={channel}
          />
        ))}
    </div>
  );
};

export default ChatWindow;
