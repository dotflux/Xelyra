import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import axios from "axios";
import openSidebarIcon from "../../../assets/openSidebar.svg";
import vcIcon from "../../../assets/vc.svg";

interface Reciever {
  id: string;
  username: string;
  type: string;
  pfp?: string;
  displayName?: string;
}

interface Props {
  showPanel: boolean;
  setShowPanel: Dispatch<SetStateAction<boolean>>;
  onChannelInfoChange?: (info: { name: string; type: string }) => void;
}

const TopBar = (props: Props) => {
  const [searchParams] = useSearchParams();
  const { id: serverId } = useParams();
  const channel = searchParams.get("channel");
  const [recieverInfo, setReciever] = useState<Reciever | null>(null);
  const [channelInfo, setChannelInfo] = useState<{
    name: string;
    type: string;
  } | null>(null);

  const onMount = async () => {
    try {
      if (!channel) return;
      if (serverId) {
        const response = await axios.post(
          `http://localhost:3000/servers/${serverId}/channels`,
          {},
          { withCredentials: true }
        );
        if (response.data.valid) {
          for (const cat of response.data.channelsData) {
            const found = cat.channels.find((c: any) => c.id === channel);
            if (found) {
              setChannelInfo({ name: found.name, type: found.type });
              break;
            }
          }
        }
      } else {
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
  }, [channel, serverId]);

  useEffect(() => {
    if (props.onChannelInfoChange) {
      if (serverId && channelInfo) {
        props.onChannelInfoChange({
          name: channelInfo.name,
          type: channelInfo.type,
        });
      } else if (recieverInfo) {
        props.onChannelInfoChange({
          name: recieverInfo.username,
          type: recieverInfo.type,
        });
      }
    }
    // Debug: log pfp value
    if (recieverInfo) {
      console.log("TopBar recieverInfo.pfp:", recieverInfo.pfp);
    }
  }, [channelInfo, recieverInfo, serverId]);

  return (
    <div className="flex items-center space-x-4 w-full p-2 bg-[#191a1d] border-b border-[#2a2b2e] shadow-lg min-h-[44px]">
      {/* Channel Icon or Avatar */}
      {serverId && channelInfo ? (
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#23232b] mr-2">
          {channelInfo.type === "voice" ? (
            <img src={vcIcon} alt="vc" className="w-5 h-5" />
          ) : (
            <span className="text-xl text-indigo-300 font-bold">#</span>
          )}
        </div>
      ) : recieverInfo?.pfp ? (
        <img
          src={
            recieverInfo.pfp.startsWith("/uploads/")
              ? `http://localhost:3000${recieverInfo.pfp}`
              : recieverInfo.pfp.startsWith("http")
              ? recieverInfo.pfp
              : `http://localhost:3000/uploads/${recieverInfo.pfp}`
          }
          alt={recieverInfo.displayName || recieverInfo.username}
          className="h-8 w-8 rounded-full object-cover shadow-md mr-2"
        />
      ) : (
        <div className="h-8 w-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-base font-bold text-white shadow-md mr-2">
          {(recieverInfo?.displayName || recieverInfo?.username || "?")
            .charAt(0)
            .toUpperCase()}
        </div>
      )}

      {/* Channel Info */}
      <div className="flex flex-col justify-center">
        <h1 className="text-white font-bold text-[15px] leading-tight">
          {serverId && channelInfo
            ? channelInfo.name
            : recieverInfo?.displayName ||
              recieverInfo?.username ||
              "Loading..."}
        </h1>
        <span className="text-gray-400 text-xs leading-tight">
          {serverId && channelInfo
            ? channelInfo.type === "voice"
              ? "Voice Channel"
              : "Text Channel"
            : recieverInfo?.type === "group"
            ? "Group"
            : "Direct Message"}
        </span>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center space-x-2">
        <div
          className="cursor-pointer p-1.5 hover:bg-gray-900 rounded-lg transition-all duration-200 hover:scale-110"
          onClick={() => {
            props.setShowPanel(true);
          }}
        >
          <img
            src={openSidebarIcon}
            className="h-4 w-4 opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
