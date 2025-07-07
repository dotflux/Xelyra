import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import plusIcon from "../../assets/plus.svg";
import CreateGroup from "./Chat/Group/CreateGroup";
import friendsIcon from "../../assets/friends.svg";

interface ConvInfo {
  reciever: string;
  id: string;
  recieverPfp?: string;
  type?: string;
}

const ConversationsList = () => {
  const [conversationInfo, setConvInfo] = useState<ConvInfo[] | null>(null);
  const [isGroupOpen, setGroupOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasChannel = !!searchParams.get("channel");

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

  useEffect(() => {
    onMount();
  }, []);

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
      <div className="flex items-center justify-between">
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
        {conversationInfo?.map((chan, i) => (
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
                alt={chan.reciever}
                className="h-10 w-10 rounded-full object-cover border border-gray-700 shadow-lg group-hover:shadow-black/25 transition-all duration-200 flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:shadow-black/25 transition-all duration-200 flex-shrink-0">
                {chan.reciever.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="ml-3 font-medium group-hover:text-white transition-colors duration-200 truncate min-w-0 flex-1">
              {chan.reciever}
            </span>
          </li>
        ))}
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
