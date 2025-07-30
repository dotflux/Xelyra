import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

interface BansProps {
  serverId: string;
  onUpdate: () => void;
}

interface BannedUser {
  id: string;
  display_name: string;
  username: string;
  pfp: string;
}

const Bans: React.FC<BansProps> = ({ serverId, onUpdate }) => {
  const [bans, setBans] = useState<BannedUser[]>([]);
  const [loadingBans, setLoadingBans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastBanRef = useRef<HTMLDivElement | null>(null);
  const BATCH_SIZE = 70;

  const fetchBans = async (afterId?: string) => {
    if (loadingBans || fetchingMore || !hasMore) return;
    setLoadingBans(true);
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/bans/fetch`,
        { limit: BATCH_SIZE, afterId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const newBans = res.data.bansInfo || [];
      setBans((prev) => (afterId ? [...prev, ...newBans] : newBans));
      setHasMore(newBans.length === BATCH_SIZE);
    } catch (err: any) {
      if (!afterId) setBans([]);
      setError(err.response.data.message);
    } finally {
      setLoadingBans(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    setBans([]);
    setHasMore(true);
    fetchBans();
  }, [serverId]);

  const filteredBans = searchTerm
    ? bans.filter(
        (ban) =>
          ban.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ban.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : bans;

  const handleUnbanUser = async (userId: string) => {
    if (!userId) return;
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/members/unban`,
        {
          banee: userId,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setBans([]);
      setHasMore(true);
      fetchBans();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data);
        setError(err.response.data.message);
      } else {
        setError(err.response.data.message);
      }
    }
  };

  const lastBanElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingBans || fetchingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && bans.length > 0) {
          setFetchingMore(true);
          fetchBans(bans[bans.length - 1].id);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingBans, fetchingMore, hasMore, bans]
  );

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Bans</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search bans..."
            className="px-4 py-2 rounded-lg bg-[#2a2b2e] border border-[#3a3b3e] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loadingBans ? (
        <div className="text-gray-500">Loading bans...</div>
      ) : bans.length === 0 ? (
        <div className="text-gray-400">No banned users found.</div>
      ) : (
        <div className="space-y-4">
          {filteredBans.map((ban, index) => (
            <div
              key={ban.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-[#2a2b2e]"
              ref={index === filteredBans.length - 1 ? lastBanElementRef : null}
            >
              <div className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full bg-[#2a2b2e] flex items-center justify-center border-2 border-[#3a3b3e] flex-shrink-0">
                {ban.pfp ? (
                  <img
                    src={ban.pfp}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-gray-500 font-bold">
                    {(
                      ban.display_name?.[0] ||
                      ban.username?.[0] ||
                      "?"
                    ).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">
                  {ban.display_name || ban.username}
                </div>
                <div className="text-sm text-gray-400">@{ban.username}</div>
              </div>
              <button
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-xs shadow transition-colors"
                onClick={() => handleUnbanUser(ban.id)}
              >
                Unban
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bans;
