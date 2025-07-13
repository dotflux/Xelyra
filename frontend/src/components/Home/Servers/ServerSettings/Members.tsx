import React, { useState, useEffect } from "react";
import axios from "axios";

interface MembersProps {
  serverId: string;
  onUpdate: () => void;
}

const Members: React.FC<MembersProps> = ({ serverId, onUpdate }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [assigningRole, setAssigningRole] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/members/fetch`,
        {},
        { withCredentials: true }
      );
      setMembers(res.data.members || res.data);
    } catch (err: any) {
      setMembers([]);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to fetch members."
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/roles/fetch`,
        {},
        { withCredentials: true }
      );
      setRoles(res.data.roles || res.data);
    } catch (err) {
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchRoles();
  }, [serverId]);

  const filteredMembers = members.filter(
    (member) =>
      member.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignRole = async () => {
    if (!selectedMember || !selectedRole) return;
    setAssigningRole(true);
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/roles/assign`,
        {
          serverId,
          userId: selectedMember.id,
          roleId: selectedRole,
        },
        { withCredentials: true }
      );
      fetchMembers();
      setSelectedMember(null);
      setSelectedRole("");
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to assign role."
      );
    }
    setAssigningRole(false);
  };

  const handleRemoveRole = async (memberId: string, roleId: string) => {
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/roles/remove`,
        {
          serverId,
          userId: memberId,
          roleId,
        },
        { withCredentials: true }
      );
      fetchMembers();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to remove role."
      );
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
        <h3 className="text-lg font-bold text-white">Members</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search members..."
            className="px-4 py-2 rounded-lg bg-[#2a2b2e] border border-[#3a3b3e] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loadingMembers ? (
        <div className="text-gray-500">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="text-gray-400">No members found.</div>
      ) : (
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-[#1e1f22] border border-[#3a3b3e]"
            >
              <div className="w-10 h-10 rounded-full bg-[#2a2b2e] flex items-center justify-center border-2 border-[#3a3b3e]">
                {member.pfp ? (
                  <img
                    src={member.pfp}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-gray-500 font-bold">
                    {member.display_name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">
                  {member.display_name || member.username}
                </div>
                <div className="text-sm text-gray-400">@{member.username}</div>
                {member.roles && member.roles.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {member.roles.map((role: any) => (
                      <div
                        key={role.id}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-[#2a2b2e] border border-[#3a3b3e]"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: role.color || "#5865F2" }}
                        />
                        <span className="text-xs text-white">{role.name}</span>
                        <button
                          onClick={() => handleRemoveRole(member.id, role.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded font-semibold text-xs shadow transition-colors"
                onClick={() => setSelectedMember(member)}
              >
                Assign Role
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assign Role Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#202127] rounded-lg shadow-xl p-8 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white">
                Assign Role to{" "}
                {selectedMember.display_name || selectedMember.username}
              </h4>
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setSelectedRole("");
                }}
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
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Select Role
                </label>
                <select
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">Choose a role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
                  onClick={handleAssignRole}
                  disabled={!selectedRole || assigningRole}
                >
                  {assigningRole ? "Assigning..." : "Assign Role"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded font-semibold transition-colors"
                  onClick={() => {
                    setSelectedMember(null);
                    setSelectedRole("");
                  }}
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

export default Members;
