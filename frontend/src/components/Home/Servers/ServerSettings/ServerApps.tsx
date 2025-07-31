import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

interface ServerAppsProps {
  serverId: string;
  onUpdate: () => void;
}

interface ServerApp {
  id: string;
  name: string;
  pfp: string;
}

const ServerApps: React.FC<ServerAppsProps> = ({ serverId, onUpdate }) => {
  const [apps, setApps] = useState<ServerApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const BATCH_SIZE = 70;

  const fetchServerApps = async (afterId?: string) => {
    if (loading || fetchingMore || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/apps/fetch`,
        { limit: BATCH_SIZE, afterId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const newApps = res.data.apps || [];
      setApps((prev) => (afterId ? [...prev, ...newApps] : newApps));
      setHasMore(newApps.length === BATCH_SIZE);
    } catch (err: any) {
      if (!afterId) setApps([]);
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data.message);
        setError(err.response.data.message);
      } else {
        console.log("Network Error:", err);
      }
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    setApps([]);
    setHasMore(true);
    fetchServerApps();
  }, [serverId]);

  const filteredApps = searchTerm
    ? apps.filter((app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : apps;

  const lastAppElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || fetchingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && apps.length > 0) {
          setFetchingMore(true);
          fetchServerApps(apps[apps.length - 1].id);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, fetchingMore, hasMore, apps]
  );

  const handleKickApp = async (appId: string) => {
    if (!appId) return;
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/apps/kick`,
        {
          kickee: appId,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setApps([]);
      setHasMore(true);
      fetchServerApps();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data);
        setError(err.response.data.message);
      } else {
        setError(err.response.data.message);
      }
    }
  };

  const handleBanApp = async (appId: string) => {
    if (!appId) return;
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/apps/ban`,
        {
          banee: appId,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setApps([]);
      setHasMore(true);
      fetchServerApps();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data);
        setError(err.response.data.message);
      } else {
        setError(err.response.data.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Server Apps</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search apps..."
            className="px-4 py-2 rounded-lg bg-[#2a2b2e] border border-[#3a3b3e] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading apps...</div>
      ) : apps.length === 0 ? (
        <div className="text-gray-400">No apps found.</div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app, index) => (
            <div
              key={app.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-[#2a2b2e]"
              ref={index === filteredApps.length - 1 ? lastAppElementRef : null}
            >
              <div className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full bg-[#2a2b2e] flex items-center justify-center border-2 border-[#3a3b3e] flex-shrink-0">
                {app.pfp ? (
                  <img
                    src={
                      app.pfp.startsWith("/uploads/")
                        ? `http://localhost:3000${app.pfp}`
                        : app.pfp
                    }
                    alt="App Icon"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-gray-500 font-bold">
                    {app.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">{app.name}</div>
                <div className="text-sm text-gray-400">App ID: {app.id}</div>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row flex-wrap">
                <button
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-semibold text-xs shadow transition-colors"
                  onClick={() => handleKickApp(app.id)}
                >
                  Kick
                </button>
                <button
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-xs shadow transition-colors"
                  onClick={() => handleBanApp(app.id)}
                >
                  Ban
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServerApps;
