import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useNavigate, useLocation } from "react-router-dom";
import plusIcon from "../../assets/plus.svg";
import CreateGroup from "./Chat/Group/CreateGroup";
import friendsIcon from "../../assets/friends.svg";
import { useUser } from "./UserContext";

interface ConvInfo {
  reciever: string;
  id: string;
  recieverPfp?: string;
  type?: string;
  unreadCount?: number;
  last_message_timestamp?: string | null;
  displayName?: string; // Added for new logic
}

const ConversationsList = () => {
  const [conversationInfo, setConvInfo] = useState<ConvInfo[] | null>(null);
  const [isGroupOpen, setGroupOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasChannel = !!searchParams.get("channel");
  const { user } = useUser();

  // Get selected conversation from URL
  const selectedChannel = searchParams.get("channel");

  const onMount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/home/conversations",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setConvInfo(response.data.convData);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  const joinAllConversations = (socket: Socket, convs: ConvInfo[]) => {
    if (!socket || !convs) return;
    const ids = convs.map((conv: ConvInfo) => conv.id);
    socket.emit("convUpdate", ids);
  };

  useEffect(() => {
    onMount();
    // Setup socket connection
    socketRef.current = io("http://localhost:3000/messages", {
      withCredentials: true,
    });
    // Listen for convAdded event
    socketRef.current.on(
      "convAdded",
      async (data: { userId1: string; userId2: string; convId: string }) => {
        // Only handle if current user is involved
        if (!user || (user.id !== data.userId1 && user.id !== data.userId2))
          return;
        if (
          !conversationInfo ||
          conversationInfo.some((c) => c.id === data.convId)
        )
          return;
        // Determine receiver (not current user)
        let receiverId = data.userId1 === user.id ? data.userId2 : data.userId1;
        try {
          // Fetch receiver info (assuming endpoint exists)
          const res = await axios.post(
            "http://localhost:3000/home/userinfo",
            { userId: receiverId },
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );
          if (res.data.valid) {
            const newConv: ConvInfo = {
              reciever: res.data.username,
              id: data.convId,
              recieverPfp: res.data.pfp,
              type: "dm",
              unreadCount: 0,
              last_message_timestamp: null,
              displayName: res.data.displayName || res.data.username, // Set displayName
            };
            setConvInfo((prev) => (prev ? [newConv, ...prev] : [newConv]));
          }
        } catch (err) {
          console.error("Failed to fetch receiver info", err);
        }
      }
    );
    // Listen for newMessage event
    socketRef.current.on(
      "newMessage",
      (msg: { conversation: string; created_timestamp: string }) => {
        setConvInfo((prev) => {
          if (!prev) return prev;
          const idx = prev.findIndex((c) => c.id === msg.conversation);
          if (idx === -1) return prev;
          // Update last_message_timestamp and move to top
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            last_message_timestamp: msg.created_timestamp,
          };
          // Move to top
          const [moved] = updated.splice(idx, 1);
          return [moved, ...updated];
        });
      }
    );
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line
  }, [user]);

  // Join all conversations when conversationInfo changes
  useEffect(() => {
    if (socketRef.current && conversationInfo) {
      joinAllConversations(socketRef.current, conversationInfo);
      // Listen for orderUpdated event
      socketRef.current.off("orderUpdated"); // Remove previous listener to avoid duplicates
      socketRef.current.on(
        "orderUpdated",
        (data: { conversationId: string; lastCreatedTimestamp: string }) => {
          setConvInfo((prev) => {
            if (!prev) return prev;
            const idx = prev.findIndex((c) => c.id === data.conversationId);
            if (idx === -1) return prev;
            // Update last_message_timestamp and move to top
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              last_message_timestamp: data.lastCreatedTimestamp,
            };
            const [moved] = updated.splice(idx, 1);
            return [moved, ...updated];
          });
        }
      );
    }
  }, [conversationInfo]);

  useEffect(() => {
    console.log("conversationInfo", conversationInfo);
  }, [conversationInfo]);

  return (
    <nav className="w-72 bg-[#18191c] border-r border-[#23232a] p-6 flex flex-col space-y-6 shadow-2xl overflow-hidden">
      {/* Friends Button */}
      <button
        className={`flex items-center gap-2 w-full mb-3 px-3 py-2 rounded-lg transition-all duration-150
          ${
            !hasChannel
              ? "bg-[#23232a] text-indigo-400"
              : "hover:bg-[#23232a]/80 text-gray-300"
          }
        `}
        onClick={() => {
          navigate("/home");
        }}
        style={{ outline: "none", border: "none" }}
      >
        <img
          src={friendsIcon}
          alt="Friends"
          className="h-5 w-5 mr-2 opacity-80"
        />
        <span className="font-semibold text-base">Friends</span>
      </button>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Direct Messages
        </h2>
        <div
          onClick={() => setGroupOpen(true)}
          className="cursor-pointer p-2 hover:bg-[#23232a] rounded-lg transition-colors duration-200 hover:scale-110"
        >
          <img
            src={plusIcon}
            alt="Add Group"
            className="h-4 w-4 opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {conversationInfo &&
          conversationInfo
            .slice()
            .sort((a, b) => {
              if (!a.last_message_timestamp && !b.last_message_timestamp)
                return 0;
              if (!a.last_message_timestamp) return 1;
              if (!b.last_message_timestamp) return -1;
              return (
                new Date(b.last_message_timestamp).getTime() -
                new Date(a.last_message_timestamp).getTime()
              );
            })
            .map((chan, i) => {
              const displayName = chan.displayName || chan.reciever;
              return (
                <li
                  key={i}
                  className={`flex items-center px-3 py-2 rounded cursor-pointer transition-all duration-200 min-w-0 group ${
                    selectedChannel === chan.id
                      ? "bg-[#23232a] border border-white/80 shadow-lg"
                      : "hover:bg-[#23232a]/80 hover:border hover:border-gray-500/60 hover:shadow-md"
                  } text-gray-100`}
                  onClick={() => {
                    navigate(`/home?channel=${chan.id}`);
                  }}
                >
                  {chan.recieverPfp ? (
                    <img
                      src={
                        chan.recieverPfp.startsWith("/uploads/")
                          ? `http://localhost:3000${chan.recieverPfp}`
                          : chan.recieverPfp
                      }
                      alt={displayName}
                      className="h-10 w-10 rounded-full object-cover border border-gray-700 shadow-lg group-hover:shadow-black/25 transition-all duration-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:shadow-black/25 transition-all duration-200 flex-shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="ml-3 font-medium group-hover:text-white transition-colors duration-200 truncate min-w-0 flex-1">
                    {displayName}
                  </span>
                  {typeof chan.unreadCount === "number" &&
                    chan.unreadCount > 0 && (
                      <span className="ml-2 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                        {chan.unreadCount}
                      </span>
                    )}
                </li>
              );
            })}
      </ul>

      {isGroupOpen && (
        <CreateGroup
          isOpen={isGroupOpen}
          onClose={() => {
            setGroupOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default ConversationsList;
