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
    <nav className="w-72 bg-[#1e1f22] border-r border-[#2a2b2e] p-4 flex flex-col space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400 uppercase">
          Direct Messages
        </h2>
        <div
          onClick={() => setGroupOpen(true)}
          className="cursor-pointer p-1 hover:bg-gray-800 rounded"
        >
          <img src={plusIcon} alt="Add Group" className="h-4 w-4" />
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto space-y-2">
        {conversationInfo?.map((chan, i) => (
          <li
            key={i}
            className="flex items-center px-2 py-1 rounded hover:bg-[#2a2b2e] text-gray-300 cursor-pointer transition gap-2"
            onClick={() => {
              navigate(`/home?channel=${chan.id}`);
            }}
          >
            <div className="h-8 w-8 bg-[#4f46e5] rounded-full flex items-center justify-center text-xs text-white">
              {chan.reciever.charAt(0).toUpperCase()}
            </div>
            {chan.reciever}
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
