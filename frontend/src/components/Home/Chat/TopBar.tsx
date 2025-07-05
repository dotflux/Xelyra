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
    <div className="flex items-center space-x-3 w-full">
      {/* Placeholder avatar */}
      <div className="h-8 w-8 bg-[#4f46e5] rounded-full flex items-center justify-center text-white font-medium">
        {recieverInfo?.username.charAt(0).toUpperCase() || "?"}
      </div>
      <h1 className="text-white font-semibold">
        {recieverInfo?.username || "Loading..."}
      </h1>
      <div
        className="ml-auto cursor-pointer p-1 hover:bg-gray-900 rounded"
        onClick={() => {
          props.setShowPanel(true);
        }}
      >
        <img src={openSidebarIcon} />
      </div>
    </div>
  );
};

export default TopBar;
