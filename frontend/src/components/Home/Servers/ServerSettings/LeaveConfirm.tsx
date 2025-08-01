import React, { useState } from "react";
import axios from "axios";

interface LeaveConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  serverName: string;
  onLeaveSuccess: () => void;
}

const LeaveConfirm: React.FC<LeaveConfirmProps> = ({
  isOpen,
  onClose,
  serverId,
  serverName,
  onLeaveSuccess,
}) => {
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLeaveServer = async () => {
    setLeaving(true);
    setError(null);
    try {
      const response = await axios.post(
        `http://localhost:3000/servers/${serverId}/leave`,
        {},
        { withCredentials: true }
      );
      if (response.data.valid) {
        onLeaveSuccess();
      } else {
        setError(response.data.message || "Failed to leave server");
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Failed to leave server");
      } else {
        setError("Network error occurred");
      }
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#202127] rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-white">Leave Server</h4>
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

        <div className="space-y-4">
          <div className="text-gray-300">
            Are you sure you want to leave{" "}
            <span className="text-white font-semibold">{serverName}</span>? You
            won't be able to rejoin unless you're invited again.
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
              onClick={handleLeaveServer}
              disabled={leaving}
            >
              {leaving ? "Leaving..." : "Leave Server"}
            </button>
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded font-semibold transition-colors"
              onClick={onClose}
              disabled={leaving}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveConfirm;
