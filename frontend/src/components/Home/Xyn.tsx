import { useEffect, useState, useRef } from "react";
import { useUser } from "./UserContext";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import Typer from "./Chat/Typer";
import MessageBox from "./Chat/MessageBox";
import xynIcon from "../../../public/xelyra.png";
import { useNavigate } from "react-router-dom";

interface Message {
  user: string;
  message: string;
  conversation: string;
  is_read: boolean;
  id: string;
  created_at: string;
  created_timestamp: string;
  edited: boolean;
  reply_to: string;
  files?: string[];
}

const Xyn = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const xynId = user?.xyn_id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [repliedContent, setRepliedContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch messages for the Xyn DM
  const fetchMessages = async (
    cursors?: { userCursor?: string },
    limit: number = cursors ? 10 : 20
  ) => {
    if (!xynId) return;
    setLoadingMore(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/home/messages",
        {
          conversation: xynId,
          userCursor: cursors?.userCursor,
          limit,
        },
        { withCredentials: true }
      );
      if (response.data.valid) {
        let allMessages = response.data.messages || [];
        allMessages = allMessages.sort(
          (a: Message, b: Message) =>
            new Date(a.created_timestamp).getTime() -
            new Date(b.created_timestamp).getTime()
        );
        setHasMore(allMessages.length === limit);
        if (cursors) {
          // Pagination: prepend and maintain scroll
          if (messagesContainerRef.current) {
            const prevScrollHeight = messagesContainerRef.current.scrollHeight;
            const prevScrollTop = messagesContainerRef.current.scrollTop;
            setMessages((prev) => [...allMessages, ...prev]);
            setTimeout(() => {
              if (messagesContainerRef.current) {
                const newScrollHeight =
                  messagesContainerRef.current.scrollHeight;
                messagesContainerRef.current.scrollTop =
                  newScrollHeight - prevScrollHeight + prevScrollTop;
              }
            }, 0);
          } else {
            setMessages((prev) => [...allMessages, ...prev]);
          }
        } else {
          setMessages(allMessages);
        }
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [xynId]);

  useEffect(() => {
    if (!xynId) return;
    socketRef.current = io("http://localhost:3000/messages", {
      withCredentials: true,
    });
    socketRef.current.emit("joinConversation", xynId);
    socketRef.current.on("newMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    socketRef.current.on("messageEdited", ({ messageId, message, edited }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, message, edited } : m))
      );
    });
    socketRef.current.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [xynId]);

  // Scroll handler for pagination
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop < 100 && hasMore && !loadingMore) {
      const oldestUserCreatedAt = messages[0]?.created_at;
      if (oldestUserCreatedAt)
        fetchMessages({ userCursor: oldestUserCreatedAt }, 10);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!xynId) return null;

  return (
    <section className="flex flex-col h-full w-full bg-[#191a1e] border-l border-[#23232a] shadow-2xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full p-3 bg-[#191a1d] border-b border-[#2a2b2e] shadow-lg min-h-[44px]">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-base font-bold text-white shadow-md mr-2">
            <img
              src={xynIcon}
              alt="Xyn"
              className="w-full h-full rounded-full"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-white font-bold text-[15px] leading-tight">
              Xyn
            </h1>
            <span className="text-gray-400 text-xs leading-tight">
              Your AI Assistant
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/home?channel=${xynId}`)}
          className="px-3 py-1.5 hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors text-sm flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg font-semibold opacity-60 select-none">
            No messages yet. Say hi to Xyn!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBox
              key={msg.id}
              user={msg.user}
              id={msg.id}
              message={msg.message}
              createdAt={msg.created_at}
              createdAtTimestamp={msg.created_timestamp}
              grouped={false}
              edited={msg.edited}
              conversation={msg.conversation}
              userId={user?.id || ""}
              setRepliedTo={setReplyTo}
              setRepliedContent={setRepliedContent}
              repliedTo={msg.reply_to}
              files={msg.files}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-[#23232a] bg-[#18191c] p-3">
        <Typer
          channelId={xynId}
          replyTo={replyTo}
          repliedContent={repliedContent}
          setReplyTo={setReplyTo}
          setRepliedContent={setRepliedContent}
          channelType="dm"
          alwaysTriggerAI={true}
        />
      </div>
    </section>
  );
};

export default Xyn;
