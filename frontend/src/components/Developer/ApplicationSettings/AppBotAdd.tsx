import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface ServerInfo {
  name: string;
  id: string;
  pfp?: string;
}

const AppBotAdd: React.FC = () => {
  const { id } = useParams();
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingServer, setAddingServer] = useState<string | null>(null);

  const fetchServersWithPermission = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        "http://localhost:3000/home/servers/permissionToAdd",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setServers(res.data.serverData || []);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        console.log("Error response:", err.response.data);
        setError(err.response.data.message);
      } else {
        setError(err.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToServer = async (serverId: string) => {
    if (!id || !serverId) return;
    setAddingServer(serverId);
    try {
      await axios.post(
        `http://localhost:3000/developer/applications/${id}/add/${serverId}`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setServers((prev) => prev.filter((server) => server.id !== serverId));
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data);
        setError(err.response.data.message);
      } else {
        setError(err.response.data.message);
      }
    } finally {
      setAddingServer(null);
    }
  };

  useEffect(() => {
    fetchServersWithPermission();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Add to Server</h3>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading servers...</div>
      ) : servers.length === 0 ? (
        <div className="text-gray-400">
          No servers found where you have admin permission.
        </div>
      ) : (
        <div className="space-y-4">
          {servers.map((server) => (
            <div
              key={server.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-[#2a2b2e]"
            >
              <div className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full bg-[#2a2b2e] flex items-center justify-center border-2 border-[#3a3b3e] flex-shrink-0">
                {server.pfp ? (
                  <img
                    src={
                      server.pfp.startsWith("/uploads/")
                        ? `http://localhost:3000${server.pfp}`
                        : server.pfp
                    }
                    alt="Server Icon"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-gray-500 font-bold">
                    {server.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">{server.name}</div>
                <div className="text-sm text-gray-400">
                  Server ID: {server.id}
                </div>
              </div>
              <button
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-xs shadow transition-colors disabled:opacity-50"
                onClick={() => handleAddToServer(server.id)}
                disabled={addingServer === server.id}
              >
                {addingServer === server.id ? "Adding..." : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppBotAdd;
