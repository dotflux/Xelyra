import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import openSidebarIcon from "../../../assets/openSidebar.svg";

interface Reciever {
  id: string;
  username: string;
  type: string;
}

interface Props {
  showPanel: boolean;
  setShowPanel: Dispatch<SetStateAction<boolean>>;
}

const TopBar = (props: Props) => {
  const [searchParams] = useSearchParams();
  const channel = searchParams.get("channel");
  const [recieverInfo, setReciever] = useState<Reciever | null>(null);
  const onMount = async () => {
    try {
      if (!channel) return;
      const response = await axios.post(
        "http://localhost:3000/home/recieverInfo",
        { conversation: channel },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setReciever(response.data.recieverData);
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
  }, [channel]);
  return (
    <div className="flex items-center space-x-4 w-full p-4 bg-[#191a1d] border-b border-[#2a2b2e] shadow-lg">
      {/* Avatar */}
      <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md mr-3">
        {recieverInfo?.username.charAt(0).toUpperCase() || "?"}
      </div>

      {/* Channel Info */}
      <div className="flex flex-col">
        <h1 className="text-white font-bold text-lg">
          {recieverInfo?.username || "Loading..."}
        </h1>
        <span className="text-gray-400 text-sm">
          {recieverInfo?.type === "group" ? "Group" : "Direct Message"}
        </span>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center space-x-2">
        <div
          className="cursor-pointer p-2 hover:bg-gray-900 rounded-lg transition-all duration-200 hover:scale-110"
          onClick={() => {
            props.setShowPanel(true);
          }}
        >
          <img
            src={openSidebarIcon}
            className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
