import React, { useState, useEffect } from "react";
import axios from "axios";

interface OverviewProps {
  serverId: string;
  serverInfo: any;
  onUpdate: (updates: any) => void;
}

const Overview: React.FC<OverviewProps> = ({
  serverId,
  serverInfo,
  onUpdate,
}) => {
  const [serverEdit, setServerEdit] = useState<any | null>(null);
  const [savingServer, setSavingServer] = useState(false);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (serverInfo) {
      setServerEdit({
        name: serverInfo.name || "",
        description: serverInfo.description || "",
      });
    }
  }, [serverInfo]);

  const serverChanged =
    serverEdit &&
    (serverEdit.name !== serverInfo?.name ||
      serverEdit.description !== (serverInfo?.description || ""));

  const handleServerField = (field: string, value: any) => {
    setServerEdit((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveServer = async () => {
    if (!serverEdit) return;
    setSavingServer(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/update`,
        { name: serverEdit.name },
        { withCredentials: true }
      );
      if (res.data?.valid) {
        onUpdate({ name: serverEdit.name });
        setSuccess("Server updated successfully!");
      } else {
        setError(
          res.data?.error ||
            res.data?.message ||
            "Failed to update server name."
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to update server name."
      );
    }
    setSavingServer(false);
  };

  const handleResetServer = () => {
    setServerEdit({
      name: serverInfo.name || "",
      description: serverInfo.description || "",
    });
    setError(null);
    setSuccess(null);
  };

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPfp(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/pfp`,
        formData,
        { withCredentials: true }
      );
      if (res.data?.pfp) {
        onUpdate({ pfp: res.data.pfp });
      }
    } catch (err) {
      setError("Failed to upload server icon.");
    }
    setUploadingPfp(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}
      {serverInfo ? (
        <div className="space-y-8">
          <div className="bg-[#1e1f22] rounded-xl p-6 border border-[#3a3b3e]">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-xl bg-[#2a2b2e] flex items-center justify-center border-2 border-[#3a3b3e] shadow-lg overflow-hidden">
                  {uploadingPfp ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-indigo-400 animate-pulse text-sm">
                        Uploading...
                      </span>
                    </div>
                  ) : serverInfo.pfp ? (
                    <img
                      src={serverInfo.pfp}
                      alt="Server Icon"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-gray-500 font-bold">
                      {serverInfo.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-[#1e1f22] border-2 border-[#3a3b3e] rounded-full p-1.5 cursor-pointer hover:bg-[#3a3b3e] transition-colors group-hover:scale-110">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIconChange}
                  />
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 12v6m0 0l-3-3m3 3l3-3M12 6v6"
                    />
                  </svg>
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">
                  Server Icon
                </h2>
                <p className="text-sm text-gray-400">
                  Upload a new server icon (PNG, JPG, GIF)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1f22] rounded-xl p-6 border border-[#3a3b3e]">
            <h3 className="text-lg font-bold text-white mb-4">
              Server Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Server Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-[#2a2b2e] border border-[#3a3b3e] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium transition-colors"
                  value={serverEdit?.name || ""}
                  onChange={(e) => handleServerField("name", e.target.value)}
                  placeholder="Enter server name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-[#2a2b2e] border border-[#3a3b3e] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                  value={serverEdit?.description || ""}
                  onChange={(e) =>
                    handleServerField("description", e.target.value)
                  }
                  placeholder="Add a description for your server..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1e1f22] rounded-xl p-6 border border-[#3a3b3e]">
            <h3 className="text-lg font-bold text-white mb-4">
              Server Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#2a2b2e] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Server ID</div>
                <div className="text-white font-mono text-sm">
                  {serverInfo?.id || "-"}
                </div>
              </div>
              <div className="bg-[#2a2b2e] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Created</div>
                <div className="text-white text-sm">
                  {serverInfo?.created_at
                    ? new Date(serverInfo.created_at).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveServer}
              disabled={!serverChanged || savingServer}
            >
              {savingServer ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-[#2a2b2e] hover:bg-[#3a3b3e] text-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResetServer}
              disabled={savingServer}
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            Loading server information...
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
