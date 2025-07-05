import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import plusIcon from "../../assets/plus.svg";
import CreateGroup from "./Chat/Group/CreateGroup";

interface ConvInfo {
  reciever: string;
  id: string;
}

const ConversationsList = () => {
  const [conversationInfo, setConvInfo] = useState<ConvInfo[] | null>(null);
  const [isGroupOpen, setGroupOpen] = useState(false);
  const navigate = useNavigate();

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
    <nav className="w-72 bg-[#1e1f22] border-r border-[#2a2b2e] p-6 flex flex-col space-y-6 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Direct Messages
        </h2>
        <div
          onClick={() => setGroupOpen(true)}
          className="cursor-pointer p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 hover:scale-110"
        >
          <img
            src={plusIcon}
            alt="Add Group"
            className="h-4 w-4 opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {conversationInfo?.map((chan, i) => (
          <li
            key={i}
            className="flex items-center px-3 py-2 rounded-xl hover:bg-[#2a2b2e] text-gray-300 cursor-pointer transition-all duration-200 hover:scale-[1.02] group min-w-0"
            onClick={() => {
              navigate(`/home?channel=${chan.id}`);
            }}
          >
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-200 flex-shrink-0">
              {chan.reciever.charAt(0).toUpperCase()}
            </div>
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
