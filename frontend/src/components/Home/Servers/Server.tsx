import { useUser } from "../UserContext";
import ServersList from "../ServersList";
import { useSearchParams } from "react-router-dom";
import HomeBG from "../HomeBG";
import ChatWindow from "../Chat/ChatWindow";
import ChannelsList from "./ChannelsList";
import { useEffect, useState } from "react";
import ChannelSettings from "./ChannelSettings/ChannelSettings";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import BelowBar from "../BelowBar";

interface ServerInfo {
  id: string;
  name: string;
  icon: string;
}

const Server = () => {
  const [searchParams] = useSearchParams();
  const channel = searchParams.get("channel");
  const { user } = useUser();
  const [showChannelSettings, setChannelSettings] = useState<string | null>(
    null
  );
  const { id } = useParams();
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const navigate = useNavigate();

  const onMount = async () => {
    if (!id) return;
    try {
      const response = await axios.post(
        `http://localhost:3000/servers/${id}`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.valid) {
        setServerInfo(response.data.serverInfo);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      navigate("/home");
    }
  };

  useEffect(() => {
    onMount();
  }, []);

  if (!serverInfo) return "Loading..";
  if (!user) return "Loading..";
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <HomeBG />

      <div className="relative z-10 flex h-full">
        {/* 1) ServersList */}
        <div className={channel ? "hidden sm:flex" : "flex"}>
          <ServersList />
        </div>

        {/* 2) ConversationsList */}
        <div className={channel ? "hidden sm:flex" : "flex"}>
          <ChannelsList
            openSettings={setChannelSettings}
            isOpen={showChannelSettings !== null}
            closeSettings={() => {
              setChannelSettings(null);
            }}
            serverName={serverInfo?.name}
          />
        </div>

        {/* 3) Right-hand panel */}
        <div className={channel ? "flex-1" : "relative flex h-full w-full"}>
          {channel ? <ChatWindow id={user.id} /> : "No channel selected."}
        </div>
      </div>
      {/* BelowBar: fixed at bottom left, always visible */}
      <div className="fixed left-0 bottom-0 z-30 m-4">
        <BelowBar />
      </div>
      {showChannelSettings !== null && (
        <ChannelSettings
          channel={showChannelSettings}
          onClose={() => setChannelSettings(null)}
        />
      )}
    </div>
  );
};

export default Server;
