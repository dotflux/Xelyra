import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import messageIcon from "../../assets/message.svg";

interface FriendInfo {
  username: string;
  id: string;
  conversation: string | null;
  pfp?: string;
}

interface Props {
  onClose: () => void;
}

const FriendList = (props: Props) => {
  const [friendInfo, setFriendInfo] = useState<FriendInfo[] | null>(null);
  const navigate = useNavigate();

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
  }, []);

  return (
    <aside className="flex-1 bg-[#202225] border-l border-[#2a2b2e] p-6 flex flex-col space-y-6 shadow-2xl overflow-hidden">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
        Friends
      </h2>
      <ul className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {friendInfo?.map((f, i) => (
          <li
            key={i}
            className="flex items-center p-2 rounded-2xl bg-gradient-to-br from-[#23232a]/80 to-[#191a1e]/90 border border-[#23232a] shadow-lg hover:shadow-xl hover:border-indigo-500/60 transition-all duration-200 group min-w-0 backdrop-blur-md hover:scale-[1.025]"
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
                  alt={f.username}
                  className="h-10 w-10 rounded-full object-cover border border-gray-700 shadow-md"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-base font-bold text-white shadow-md">
                  {f.username.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Status dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#23232a] rounded-full shadow-md"></span>
            </div>
            <span className="ml-4 text-gray-100 font-semibold flex-1 group-hover:text-white transition-colors duration-200 truncate min-w-0 text-[15px]">
              {f.username}
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
        ))}
      </ul>
    </aside>
  );
};

export default FriendList;
