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
    <aside className="flex-1 bg-[#202225] border-l border-[#2a2b2e] p-4 flex flex-col space-y-4 shadow-inner">
      <h2 className="text-sm font-semibold text-gray-400 uppercase">Friends</h2>
      <ul className="flex-1 overflow-y-auto space-y-3">
        {friendInfo?.map((f, i) => (
          <li
            key={i}
            className="flex items-center space-x-3 p-2 rounded hover:bg-[#2a2b2e] transition cursor-pointer"
          >
            <div className="h-8 w-8 bg-[#4f46e5] rounded-full flex items-center justify-center text-xs text-white">
              {f.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-200">{f.username}</span>
            <div
              className="ml-auto p-1 h-12 w-12 hover:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // prevents li click if you add one later
                onMessage(f.id, f.conversation);
              }}
            >
              <img src={messageIcon} className="h-6 w-6" />
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default FriendList;
