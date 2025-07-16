import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  groupId: string | null;
}

interface GroupInfo {
  name: string;
  pfp: string;
}

const GroupSettingsModal: React.FC<Props> = ({ isOpen, onClose, groupId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [newName, setNewName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onMount = async () => {
    try {
      if (!isOpen) return;
      if (!groupId) return;
      const response = await axios.post(
        "http://localhost:3000/home/groups/fetch/info",
        { group: groupId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setGroupInfo(response.data.groupInfo);
        setNewName(response.data.groupInfo.name);
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
    if (isOpen && groupId) {
      onMount();
    }
  }, [isOpen, groupId]);

  const handlePfpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!groupId || !e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("groupId", groupId);
    formData.append("pfp", e.target.files[0]);
    try {
      const res = await axios.post(
        "http://localhost:3000/home/groups/pfp",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.data.valid) {
        setGroupInfo((prev) => (prev ? { ...prev, pfp: res.data.pfp } : prev));
      } else {
        setError(res.data.message || "Failed to update group picture");
      }
    } catch (err) {
      setError("Failed to update group picture");
    }
    setUploading(false);
  };

  const handleNameChange = async () => {
    if (!groupId || !newName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await axios.post(
        "http://localhost:3000/home/groups/name",
        {
          groupId,
          name: newName.trim(),
        },
        { withCredentials: true }
      );
      if (res.data.valid) {
        setGroupInfo((prev) =>
          prev ? { ...prev, name: newName.trim() } : prev
        );
      } else {
        setError(res.data.message || "Failed to update group name");
      }
    } catch (err) {
      setError("Failed to update group name");
    }
    setSaving(false);
  };

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    try {
      const response = await axios.post(
        "http://localhost:3000/home/groups/leave",
        { group: groupId },
        { withCredentials: true }
      );
      if (response.data.valid) {
        navigate("/home");
        onClose();
      } else {
        setError(response.data.message || "Failed to leave group");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
      } else {
        setError("Failed to leave group");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#23232a] rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-700">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
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
        <h2 className="text-xl font-bold text-white mb-6">Group Settings</h2>
        {/* Group PFP */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {groupInfo?.pfp ? (
              <img
                src={
                  groupInfo.pfp.startsWith("/uploads/")
                    ? `http://localhost:3000${groupInfo.pfp}`
                    : groupInfo.pfp
                }
                alt="Group PFP"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-700 shadow-md"
              />
            ) : (
              <div className="h-20 w-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md">
                G
              </div>
            )}
            <button
              className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg border-2 border-white"
              onClick={() => fileInputRef.current?.click()}
              title="Change Group Picture"
              disabled={uploading}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13h6m2 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6"
                />
              </svg>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePfpChange}
              disabled={uploading}
            />
          </div>
          <span className="text-gray-300 text-sm mt-2">
            Change Group Picture
          </span>
        </div>
        {/* Group Name */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm mb-1">Group Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-[#191a1e] border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
            placeholder="Enter new group name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={saving}
          />
          <button
            className="mt-2 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors disabled:opacity-60"
            onClick={handleNameChange}
            disabled={
              saving || !newName.trim() || newName.trim() === groupInfo?.name
            }
          >
            {saving ? "Saving..." : "Save Name"}
          </button>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
        )}
        {/* Leave Group */}
        <button
          className="w-full py-2 mt-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
          onClick={handleLeaveGroup}
        >
          Leave Group
        </button>
      </div>
    </div>
  );
};

export default GroupSettingsModal;
