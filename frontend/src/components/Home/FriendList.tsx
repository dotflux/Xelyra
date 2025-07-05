import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import messageIcon from "../../assets/message.svg";

interface FriendInfo {
  username: string;
  id: string;
  conversation: string | null;
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
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
        Friends
      </h2>
      <ul className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {friendInfo?.map((f, i) => (
          <li
            key={i}
            className="flex items-center p-3 rounded-xl hover:bg-[#2a2b2e] transition-all duration-200 hover:scale-[1.02] group min-w-0"
          >
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-200 flex-shrink-0">
              {f.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-200 font-medium flex-1 group-hover:text-white transition-colors duration-200 truncate min-w-0 ml-4">
              {f.username}
            </span>
            <div
              className="p-2 h-10 w-10 hover:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg flex-shrink-0 ml-2"
              onClick={(e) => {
                e.stopPropagation(); // prevents li click if you add one later
                onMessage(f.id, f.conversation);
              }}
            >
              <img
                src={messageIcon}
                className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default FriendList;
