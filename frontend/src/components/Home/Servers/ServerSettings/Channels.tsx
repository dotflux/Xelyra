import React, { useState, useEffect } from "react";
import axios from "axios";

interface ChannelsProps {
  serverId: string;
  onUpdate: () => void;
}

const Channels: React.FC<ChannelsProps> = ({ serverId, onUpdate }) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    type: "text",
    category: "",
  });
  const [creating, setCreating] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchChannels = async () => {
    setLoadingChannels(true);
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/channels/fetch`,
        {},
        { withCredentials: true }
      );
      setChannels(res.data.channels || res.data);
    } catch (err: any) {
      setChannels([]);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to fetch channels."
      );
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/categories/fetch`,
        {},
        { withCredentials: true }
      );
      setCategories(res.data.categories || res.data);
    } catch (err) {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchCategories();
  }, [serverId]);

  const handleCreateChannel = async () => {
    setCreating(true);
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/channels/create`,
        {
          name: newChannel.name,
          type: newChannel.type,
          category: newChannel.category || null,
        },
        { withCredentials: true }
      );
      setShowCreateChannel(false);
      setNewChannel({ name: "", type: "text", category: "" });
      fetchChannels();
    } catch {
      setError("Failed to create channel");
    }
    setCreating(false);
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/channels/delete`,
        { channelId },
        { withCredentials: true }
      );
      fetchChannels();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete channel."
      );
    }
  };

  const groupedChannels = channels.reduce((acc: any, channel: any) => {
    const category = channel.category || "No Category";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Channels</h3>
        <button
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition-colors"
          onClick={() => setShowCreateChannel(true)}
        >
          + Create Channel
        </button>
      </div>

      {loadingChannels ? (
        <div className="text-gray-500">Loading channels...</div>
      ) : channels.length === 0 ? (
        <div className="text-gray-400">
          No channels found. Create the first channel!
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedChannels).map(
            ([category, categoryChannels]: [string, any]) => (
              <div
                key={category}
                className="bg-[#1e1f22] rounded-xl p-6 border border-[#3a3b3e]"
              >
                <h4 className="text-lg font-bold text-white mb-4">
                  {category}
                </h4>
                <div className="space-y-3">
                  {categoryChannels.map((channel: any) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[#2a2b2e] border border-[#3a3b3e]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#3a3b3e] flex items-center justify-center">
                          {channel.type === "text" ? (
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            #{channel.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {channel.type === "text"
                              ? "Text Channel"
                              : "Voice Channel"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-xs shadow transition-colors"
                          onClick={() => handleDeleteChannel(channel.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#202127] rounded-lg shadow-xl p-8 w-full max-w-sm relative">
            <button
              onClick={() => setShowCreateChannel(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
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
            <h4 className="text-lg font-bold text-white mb-4">
              Create Channel
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newChannel.name}
                  onChange={(e) =>
                    setNewChannel((c) => ({ ...c, name: e.target.value }))
                  }
                  placeholder="channel-name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Channel Type
                </label>
                <select
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newChannel.type}
                  onChange={(e) =>
                    setNewChannel((c) => ({ ...c, type: e.target.value }))
                  }
                >
                  <option value="text">Text Channel</option>
                  <option value="voice">Voice Channel</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Category (Optional)
                </label>
                <select
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newChannel.category}
                  onChange={(e) =>
                    setNewChannel((c) => ({ ...c, category: e.target.value }))
                  }
                >
                  <option value="">No Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors"
                  onClick={handleCreateChannel}
                  disabled={!newChannel.name || creating}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded font-semibold transition-colors"
                  onClick={() => setShowCreateChannel(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Channels;
