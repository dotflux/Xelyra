import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ChannelSidebar from "./ChannelSidebar";
import Overview from "./Overview";
import Permissions from "./Permissions";

type TabKey = "overview" | "permissions";

interface Props {
  channel: string;
  onClose: () => void;
}

interface Overwrite {
  targetName: string;
  targetId: string;
  allow: string[];
  deny: string[];
}

interface Role {
  name: string;
  role_id: string;
  color: string;
}

interface ChannelSettings {
  name: string;
  overwrites: Overwrite[];
  roles: Role[];
}

const ChannelSettings = (props: Props) => {
  const { id } = useParams();
  const [channelSettings, setChannelSettings] =
    useState<ChannelSettings | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const onMount = async () => {
    try {
      if (!props.channel || !id) return;
      const response = await axios.post(
        `http://localhost:3000/servers/${id}/channels/${props.channel}/settings/fetch`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setChannelSettings(response.data.settings);
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
  }, [id, props.channel]);

  if (!props.channel) return null;
  if (!channelSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black bg-opacity-60">
      <div className="w-full h-full bg-[#0c0d0e] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a2b2e] bg-[#19191b]">
          <h2 className="text-2xl font-bold text-white">
            #{channelSettings.name}
          </h2>
          <button
            onClick={props.onClose}
            className="text-gray-400 hover:text-white text-2xl"
            aria-label="Close settings"
          >
            &times;
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <ChannelSidebar
            channelName={channelSettings.name}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
          />

          <main className="flex-1 overflow-auto p-6 bg-[#1e1f22]">
            {activeTab === "overview" && (
              <Overview
                channelId={props.channel}
                channelName={channelSettings.name}
              />
            )}
            {activeTab === "permissions" && (
              <Permissions
                channelId={props.channel}
                permissions={channelSettings.overwrites}
                roles={channelSettings.roles}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ChannelSettings;
