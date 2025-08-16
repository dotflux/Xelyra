import { useEffect, useState } from "react";
import axios from "axios";
import closeSidebarIcon from "../../../assets/closeSidebar.svg";

interface Props {
  showPanel: boolean;
  onClose: () => void;
  channel: string | null;
}

interface Participant {
  username: string;
  id: string;
  pfp: string;
  displayName: string;
}

const MembersPanel = (props: Props) => {
  const [participants, setParticipants] = useState<Participant[] | null>(null);

  useEffect(() => {
    if (!props.channel || !props.showPanel) {
      setParticipants(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.post(
          "http://localhost:3000/home/conversation/participants",
          { conversation: props.channel },
          { withCredentials: true }
        );
        if (cancelled) return;
        if (res.data?.valid) {
          setParticipants(res.data.partData || []);
        } else {
          setParticipants([]);
        }
      } catch {
        if (!cancelled) setParticipants([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.channel, props.showPanel]);

  if (!props.showPanel) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-64 bg-[#191a1d] shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2b2e]">
        <div className="text-sm font-semibold text-gray-300">Members</div>
        <button
          onClick={props.onClose}
          className="p-1 hover:bg-[#2a2b2e] rounded"
        >
          <img src={closeSidebarIcon} alt="Close" className="h-5 w-5" />
        </button>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {!participants ? (
          <div className="text-sm text-gray-400">Loading…</div>
        ) : participants.length === 0 ? (
          <div className="text-sm text-gray-400">No participants</div>
        ) : (
          participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center p-2 rounded hover:bg-[#2a2b2e] transition space-x-3"
            >
              <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md overflow-hidden">
                {p.pfp ? (
                  <img
                    src={
                      p.pfp.startsWith("/uploads/")
                        ? `http://localhost:3000${p.pfp}`
                        : p.pfp
                    }
                    alt={p.displayName ? p.displayName : p.username}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-sm font-bold">
                    {p.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-white truncate">
                {p.displayName ? p.displayName : p.username}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MembersPanel;
