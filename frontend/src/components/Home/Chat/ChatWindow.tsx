import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import TopBar from "./TopBar";
import Typer from "./Typer";
import MessageBox from "./MessageBox";
import GroupPanel from "./Group/GroupPanel";

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
}

interface Props {
  id: string;
}

const ChatWindow = (props: Props) => {
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const channel = searchParams.get("channel");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [repliedContent, setRepliedContent] = useState("");

  const [showPanel, setShowPanel] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchMessages = async (cursor?: string) => {
    setLoadingMore(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/home/messages",
        { conversation: channel, cursor },
        { withCredentials: true }
      );
      if (response.data.valid) {
        const newMessages = response.data.allMessages;
        setHasMore(newMessages.length === 10);
        if (cursor) {
          // Pagination: prepend and maintain scroll
          if (messagesContainerRef.current) {
            const prevScrollHeight = messagesContainerRef.current.scrollHeight;
            const prevScrollTop = messagesContainerRef.current.scrollTop;
            setMessages((prev) => [...newMessages, ...prev]);
            setTimeout(() => {
              if (messagesContainerRef.current) {
                const newScrollHeight =
                  messagesContainerRef.current.scrollHeight;
                messagesContainerRef.current.scrollTop =
                  newScrollHeight - prevScrollHeight + prevScrollTop;
              }
            }, 0);
          } else {
            setMessages((prev) => [...newMessages, ...prev]);
          }
        } else {
          // Initial load: set messages and scroll to bottom
          setMessages(newMessages);
          setInitialLoad(true);
        }
      }
    } catch (error) {
      // Handle error as you wish
      console.error(error);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [channel]);

  useEffect(() => {
    if (initialLoad && messages.length > 0) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
        setInitialLoad(false);
      }, 0);
    }
  }, [messages, initialLoad]);

  useEffect(() => {
    if (!channel) return;

    // 1) connect to your namespace (if you used namespace '/messages', include it)
    socketRef.current = io("http://localhost:3000/messages", {
      withCredentials: true,
    });

    // 2) join the conversation room
    socketRef.current.emit("joinConversation", channel);

    // 3) listen for new messages
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

    // 4) cleanup on unmount or channel change
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [channel]);

  // Scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop < 100 && hasMore && !loadingMore) {
      const oldest = messages[0]?.created_at;
      if (oldest) fetchMessages(oldest);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121316] z-10">
      {/* Top Bar */}
      <div className="h-14 bg-[#191a1d] border-b border-[#2a2b2e] px-4 flex items-center">
        <TopBar showPanel={showPanel} setShowPanel={setShowPanel} />
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages?.length ? (
          messages.map((msg, i) => {
            const prev = messages[i - 1];
            const sameSender = prev && prev.user === msg.user;

            const sameMinute =
              prev &&
              Math.abs(
                new Date(msg.created_timestamp).getTime() -
                  new Date(prev.created_timestamp).getTime()
              ) < 60_000;

            // Don't group messages that are replies
            const isReply = msg.reply_to && msg.reply_to.trim() !== "";
            const grouped = sameSender && sameMinute && !isReply;

            return (
              <MessageBox
                key={i}
                user={msg.user}
                id={msg.id}
                message={msg.message}
                createdAtTimestamp={msg.created_timestamp}
                createdAt={msg.created_at}
                grouped={grouped}
                edited={msg.edited}
                conversation={msg.conversation}
                userId={props.id}
                setRepliedTo={setReplyTo}
                setRepliedContent={setRepliedContent}
                repliedTo={msg.reply_to}
              />
            );
          })
        ) : (
          <p className="text-gray-500 text-center mt-8">No messages yet</p>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="h-14 bg-[#191a1d] border-b border-[#2a2b2e] px-4 flex items-center mb-2">
        <Typer
          channelId={channel}
          replyTo={replyTo}
          repliedContent={repliedContent}
          setReplyTo={setReplyTo}
          setRepliedContent={setRepliedContent}
        />
      </div>
      {showPanel && (
        <GroupPanel
          showPanel={showPanel}
          onClose={() => {
            setShowPanel(false);
          }}
          channel={channel}
        />
      )}
    </div>
  );
};

export default ChatWindow;
