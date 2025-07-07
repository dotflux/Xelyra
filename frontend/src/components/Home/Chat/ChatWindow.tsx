import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import TopBar from "./TopBar";
import Typer from "./Typer";
import MessageBox from "./MessageBox";
import GroupPanel from "./Group/GroupPanel";
import CommandBox from "./CommandBox";

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
  command?: string;
  bot_id?: string;
  files?: string[];
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
  const [repliedSenderType, setRepliedSenderType] = useState<string | null>(
    null
  );

  const [showPanel, setShowPanel] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [channelInfo, setChannelInfo] = useState<{
    name: string;
    type: string;
  } | null>(null);

  const fetchMessages = async (
    cursors?: { userCursor?: string; commandCursor?: string },
    limit: number = cursors ? 10 : 20
  ) => {
    setLoadingMore(true);
    try {
      console.log("Fetching messages. Cursors:", cursors, "Limit:", limit);
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
      if (response.data.valid) {
        // Merge and sort messages and commands by created_timestamp (oldest to newest)
        const allMessages = [
          ...(response.data.messages || []),
          ...(response.data.commands || []),
        ].sort(
          (a, b) =>
            new Date(a.created_timestamp).getTime() -
            new Date(b.created_timestamp).getTime()
        );
        // Debug: print the final render order
        console.log("FINAL RENDER ORDER:");
        allMessages.forEach((msg, idx) => {
          console.log(
            `#${idx + 1}:`,
            msg.created_timestamp,
            msg.command ? `(COMMAND: /${msg.command})` : "(USER MESSAGE)"
          );
        });
        setHasMore(
          response.data.messages?.length === limit ||
            response.data.commands?.length === limit
        );
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
          // Initial load: set messages and scroll to bottom
          setMessages(allMessages);
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

    socketRef.current.on("commandEdited", ({ messageId, message, edited }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, message, edited } : m))
      );
    });

    socketRef.current.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    socketRef.current.on("commandDeleted", ({ messageId }) => {
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
    console.log(
      "ScrollTop:",
      target.scrollTop,
      "hasMore:",
      hasMore,
      "loadingMore:",
      loadingMore
    );
    if (target.scrollTop < 100 && hasMore && !loadingMore) {
      // Find the oldest user message and command message created_at
      const oldestUserCreatedAt = messages.filter((m) => !m.command)[0]
        ?.created_at;
      const oldestCommandCreatedAt = messages.filter((m) => m.command)[0]
        ?.created_at;
      console.log("Fetching older messages with cursors:", {
        userCursor: oldestUserCreatedAt,
        commandCursor: oldestCommandCreatedAt,
      });
      if (oldestUserCreatedAt || oldestCommandCreatedAt)
        fetchMessages(
          {
            userCursor: oldestUserCreatedAt,
            commandCursor: oldestCommandCreatedAt,
          },
          10
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121316]">
      {/* Top Bar */}
      <TopBar
        showPanel={showPanel}
        setShowPanel={setShowPanel}
        onChannelInfoChange={setChannelInfo}
      />

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loadingMore && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        )}

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
            const isReply = msg.reply_to && msg.reply_to.trim() !== "";
            const prevIsCommand = prev && prev.command;
            const currentIsCommand = msg.command;
            const grouped =
              sameSender &&
              sameMinute &&
              !isReply &&
              !prevIsCommand &&
              !currentIsCommand;

            // Render CommandBox for command/bot messages
            if (msg.command) {
              return (
                <CommandBox
                  key={i}
                  botName={msg.bot_id ? msg.bot_id : "Bot"}
                  command={msg.command}
                  message={msg.message}
                  createdAt={msg.created_at}
                  createdAtTimestamp={msg.created_timestamp}
                  conversation={msg.conversation}
                  id={msg.id}
                  edited={msg.edited}
                />
              );
            }

            // Render MessageBox for normal messages
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
                files={msg.files}
                setRepliedSenderType={setRepliedSenderType}
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

      {/* Typer */}
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
