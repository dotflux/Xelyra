import React, { useState, useEffect } from "react";
import axios from "axios";
import Overview from "./Overview";
import Roles from "./Roles";
import Members from "./Members";
import Channels from "./Channels";

interface ServerSettingsProps {
  serverId: string;
  onClose: () => void;
}

const ServerSettings: React.FC<ServerSettingsProps> = ({
  serverId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: "overview", name: "Overview", icon: "📋" },
    { id: "roles", name: "Roles", icon: "👑" },
    { id: "members", name: "Members", icon: "👥" },
    { id: "channels", name: "Channels", icon: "💬" },
  ];

  const fetchServerInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/fetch`,
        {},
        { withCredentials: true }
      );
      setServerInfo(res.data.server || res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to fetch server information."
      );
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
      <div className="flex w-full h-full">
        {/* Sidebar */}
        <div className="w-80 bg-[#1e1f22] border-r border-[#3a3b3e] flex flex-col">
          <div className="p-6 border-b border-[#3a3b3e]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Server Settings</h2>
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
                    <span className="text-lg">{tab.icon}</span>
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
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
              <Members serverId={serverId} onUpdate={handleRefresh} />
            )}
            {activeTab === "channels" && (
              <Channels serverId={serverId} onUpdate={handleRefresh} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSettings;
