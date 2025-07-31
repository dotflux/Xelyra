import React, { useState, useEffect } from "react";
import axios from "axios";
import Overview from "./Overview";
import Roles from "./Roles";
import Members from "./Members";
import Bans from "./Bans";
import clipboardIcon from "../../../../assets/clipboard.svg";
import rolesIcon from "../../../../assets/roles.svg";
import userGroupIcon from "../../../../assets/userGroup.svg";
import openSidebarIcon from "../../../../assets/openSidebar.svg";
import closeSidebarIcon from "../../../../assets/closeSidebar.svg";
import banIcon from "../../../../assets/ban.svg";
import botIcon from "../../../../assets/botIcon.svg";
import ServerApps from "./ServerApps";
import botBanIcon from "../../../../assets/hammer.svg";
import ServerAppsBans from "./ServerAppsBans";

interface ServerSettingsProps {
  serverId: string;
  onClose: () => void;
  userId: string;
}

export interface ServerInfo {
  id: string;
  name: string;
  pfp: string | null;
}

const ServerSettings: React.FC<ServerSettingsProps> = ({
  serverId,
  onClose,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: "overview", name: "Overview", icon: clipboardIcon },
    { id: "roles", name: "Roles", icon: rolesIcon },
    { id: "members", name: "Members", icon: userGroupIcon },
    { id: "bans", name: "Bans", icon: banIcon },
    { id: "apps", name: "Applications", icon: botIcon },
    { id: "appBans", name: "Application Bans", icon: botBanIcon },
  ];

  const fetchServerInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.valid) {
        setServerInfo(res.data.serverInfo);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data.message);
        setError(err.response.data.message);
      } else {
        console.log("Network Error:", err);
        setError("Internal Server Error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerInfo();
  }, [serverId]);

  const handleServerUpdate = (updates: any) => {
    setServerInfo((prev: any) => ({ ...prev, ...updates }));
  };

  const handleRefresh = () => {
    fetchServerInfo();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#202127] rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <div className="text-white">Loading server settings...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#202127] rounded-lg shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">Error</div>
            <div className="text-gray-300 mb-6">{error}</div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm">
      <div className="flex w-full h-full relative">
        {/* Mobile Sidebar Toggle Button */}
        <button
          className="absolute top-4 left-4 z-50 sm:hidden bg-[#23232a] p-2 rounded-lg shadow-lg"
          onClick={() => setSidebarOpen(true)}
          style={{ display: sidebarOpen ? "none" : undefined }}
        >
          <img src={openSidebarIcon} alt="Open Sidebar" className="w-6 h-6" />
        </button>
        {/* Sidebar */}
        <div
          className={`
            fixed inset-0 z-40 bg-black/70 transition-opacity duration-200 sm:static sm:z-auto sm:bg-transparent
            ${
              sidebarOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            } sm:opacity-100 sm:pointer-events-auto
          `}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className={`
              w-80 bg-[#1e1f22] border-r border-[#3a3b3e] flex flex-col h-full transition-transform duration-200
              fixed left-0 top-0 z-50 sm:static sm:translate-x-0
              ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } sm:translate-x-0
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button on mobile */}
            <button
              className="sm:hidden absolute top-4 right-4 bg-[#23232a] p-2 rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <img
                src={closeSidebarIcon}
                alt="Close Sidebar"
                className="w-6 h-6"
              />
            </button>
            <div className="p-6 border-b border-[#3a3b3e]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Server Settings
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#2a2b2e] flex items-center justify-center border-2 border-[#3a3b3e] shadow-lg overflow-hidden">
                  {serverInfo?.pfp ? (
                    <img
                      src={serverInfo.pfp}
                      alt="Server Icon"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-gray-500 font-bold">
                      {serverInfo?.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {serverInfo?.name}
                  </div>
                  <div className="text-sm text-gray-400">Server Settings</div>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "text-gray-300 hover:bg-[#2a2b2e] hover:text-white"
                      }`}
                    >
                      <img src={tab.icon} alt={tab.name} className="w-6 h-6" />
                      {tab.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#0f0f10] overflow-y-auto">
          <div className="p-8">
            {activeTab === "overview" && (
              <Overview
                serverId={serverId}
                serverInfo={serverInfo}
                onUpdate={handleServerUpdate}
              />
            )}
            {activeTab === "roles" && (
              <Roles serverId={serverId} onUpdate={handleRefresh} />
            )}
            {activeTab === "members" && (
              <Members
                serverId={serverId}
                onUpdate={handleRefresh}
                userId={userId}
              />
            )}
            {activeTab === "bans" && (
              <Bans serverId={serverId} onUpdate={handleRefresh} />
            )}

            {activeTab === "apps" && (
              <ServerApps serverId={serverId} onUpdate={handleRefresh} />
            )}
            {activeTab === "appBans" && (
              <ServerAppsBans serverId={serverId} onUpdate={handleRefresh} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSettings;
