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
import CreateCategory from "./CreateCategory";
import CreateChannel from "./CreateChannel";
import ServerSettingsOverlay from "./ServerSettingsOverlay";

interface ServerInfo {
  id: string;
  name: string;
  pfp?: string;
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
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState<null | string>(
    null
  );
  const [showServerSettings, setShowServerSettings] = useState(false);

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
          <ServersList onOpenCreateServer={() => {}} />
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
            onOpenCreateCategory={() => setCreateCategoryOpen(true)}
            onOpenCreateChannel={(categoryId) =>
              setCreateChannelOpen(categoryId)
            }
            onOpenServerSettings={() => setShowServerSettings(true)}
          />
        </div>

        {/* 3) Right-hand panel */}
        <div className={channel ? "flex-1" : "relative flex h-full w-full"}>
          {channel ? (
            <ChatWindow id={user.id} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center w-full h-full text-center text-gray-400 select-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto mb-6 w-24 h-24 text-gray-600"
                fill="none"
                viewBox="0 0 48 48"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 38V12a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H16l-8 6z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-200 mb-2">
                No Channel Selected
              </h2>
              <p className="text-gray-400">
                Select a channel from the list to start chatting.
              </p>
            </div>
          )}
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
      {/* CreateCategory Modal (global overlay) */}
      {createCategoryOpen && (
        <CreateCategory
          isOpen={createCategoryOpen}
          onClose={() => setCreateCategoryOpen(false)}
        />
      )}
      {/* CreateChannel Modal (global overlay) */}
      {createChannelOpen && (
        <CreateChannel
          isOpen={true}
          onClose={() => setCreateChannelOpen(null)}
          categoryId={createChannelOpen}
        />
      )}
      {/* Server Settings Overlay */}
      {showServerSettings && (
        <ServerSettingsOverlay
          serverId={serverInfo.id}
          isOpen={showServerSettings}
          onClose={() => setShowServerSettings(false)}
        />
      )}
    </div>
  );
};

export default Server;
