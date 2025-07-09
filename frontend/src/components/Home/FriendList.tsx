import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import messageIcon from "../../assets/message.svg";
import RequestsList from "./RequestsList";
import AddFriendModal from "./AddFriendModal";
import SentRequestsList from "./SentRequestsList";
import { useUser } from "./UserContext";

interface FriendInfo {
  username: string;
  id: string;
  conversation: string | null;
  pfp?: string;
  displayName?: string;
}

interface Props {
  onClose: () => void;
}

const FriendList = (props: Props) => {
  const [friendInfo, setFriendInfo] = useState<FriendInfo[] | null>(null);
  const [requestsCount, setRequestsCount] = useState<number>(0);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "sent">(
    "friends"
  );
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const { user } = useUser();

  const onMount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/home/friends",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setFriendInfo(response.data.friendData);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  const fetchRequestsCount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/home/requests",
        {},
        { withCredentials: true }
      );
      if (response.data.valid) {
        setRequestsCount(response.data.requests.length);
      }
    } catch (error) {
      setRequestsCount(0);
    }
  };

  const onMessage = async (recieverId: string, conversation: string | null) => {
    if (conversation !== null) {
      props.onClose();
      navigate(`/home?channel=${conversation}`);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/home/dm",
        { recieverId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        props.onClose();
        navigate(`/home?channel=${response.data.newId}`);
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
    onMount();
    fetchRequestsCount();
    // eslint-disable-next-line
  }, [activeTab, user]);

  return (
    <aside className="flex-1 bg-[#202225] border-l border-[#2a2b2e] p-6 flex flex-col space-y-6 shadow-2xl overflow-hidden">
      {/* Top Navbar */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors duration-150 focus:outline-none
            ${
              activeTab === "friends"
                ? "bg-[#18191c] text-white"
                : "bg-transparent text-gray-400 hover:text-white"
            }`}
          onClick={() => setActiveTab("friends")}
        >
          Friends
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors duration-150 focus:outline-none
            ${
              activeTab === "requests"
                ? "bg-[#18191c] text-white"
                : "bg-transparent text-gray-400 hover:text-white"
            }`}
          onClick={() => {
            setActiveTab("requests");
            fetchRequestsCount(); // update count on tab switch
          }}
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <span>Requests</span>
          {requestsCount > 0 && (
            <span
              style={{
                marginLeft: 8,
                minWidth: 18,
                height: 18,
                background: "#ef4444",
                color: "white",
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 6px",
                boxShadow: "0 0 0 2px #18191c",
              }}
            >
              {requestsCount}
            </span>
          )}
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors duration-150 focus:outline-none
            ${
              activeTab === "sent"
                ? "bg-[#18191c] text-white"
                : "bg-transparent text-gray-400 hover:text-white"
            }`}
          onClick={() => setActiveTab("sent")}
        >
          Sent
        </button>
        <button
          className="ml-auto flex items-center gap-1 px-3 py-2 rounded-md bg-[#23232a] hover:bg-[#23232a]/80 text-gray-300 hover:text-white border border-gray-700 shadow transition-all duration-150 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="Add Friend"
          onClick={(e) => {
            e.stopPropagation();
            setAddFriendOpen(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Friend
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === "friends" && (
        <ul className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {friendInfo && friendInfo.length > 0 ? (
            friendInfo.map((f, i) => {
              const displayName = f.displayName || f.username;
              return (
                <li
                  key={i}
                  className="flex items-center p-2 rounded-2xl bg-[#18191c] shadow-lg hover:shadow-xl transition-all duration-200 group min-w-0 backdrop-blur-md hover:scale-[1.025]"
                  style={{ minHeight: 56 }}
                >
                  <div className="relative h-10 w-10 flex items-center justify-center">
                    {f.pfp ? (
                      <img
                        src={
                          f.pfp.startsWith("/uploads/")
                            ? `http://localhost:3000${f.pfp}`
                            : f.pfp
                        }
                        alt={displayName}
                        className="h-10 w-10 rounded-full object-cover border border-gray-700 shadow-md"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-base font-bold text-white shadow-md">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Status dot */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#23232a] rounded-full shadow-md"></span>
                  </div>
                  <span className="ml-4 text-gray-100 font-semibold flex-1 group-hover:text-white transition-colors duration-200 truncate min-w-0 text-[15px]">
                    {displayName}
                  </span>
                  <div
                    className="ml-2 p-2 h-10 w-10 flex items-center justify-center rounded-full bg-[#23232a]/70 hover:bg-indigo-600/80 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-indigo-500/30 shadow-md group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessage(f.id, f.conversation);
                    }}
                    title="Message"
                  >
                    <img
                      src={messageIcon}
                      className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </li>
              );
            })
          ) : (
            <li className="flex flex-col items-center justify-center h-32 text-gray-400 text-lg font-semibold select-none">
              <span>No friends yet</span>
              <span className="text-sm text-gray-500 mt-1">
                Add someone to start chatting!
              </span>
            </li>
          )}
        </ul>
      )}
      {activeTab === "requests" && (
        <RequestsList onRequestsCountChange={setRequestsCount} />
      )}
      {activeTab === "sent" && <SentRequestsList />}
      <AddFriendModal
        isOpen={addFriendOpen}
        onClose={() => setAddFriendOpen(false)}
      />
    </aside>
  );
};

export default FriendList;
