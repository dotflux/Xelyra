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
      <div className="flex">
        <h2 className="text-sm font-semibold text-gray-400 uppercase">
          Direct Messages
        </h2>
        <div
          onClick={() => {
            setGroupOpen(true);
          }}
        >
          <img
            src={plusIcon}
            className="px-2 mb-3 items-end justify-end ml-auto"
          />
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto space-y-2">
        {conversationInfo?.map((chan, i) => (
          <li
            key={i}
            className="px-2 py-1 rounded hover:bg-[#2a2b2e] text-gray-300 cursor-pointer transition"
            onClick={() => {
              navigate(`/home?channel=${chan.id}`);
            }}
          >
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
