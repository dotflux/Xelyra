import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

interface MembersProps {
  serverId: string;
  onUpdate: () => void;
  userId: string;
}

interface Member {
  id: string;
  display_name: string;
  username: string;
  pfp: string;
  roles: string[];
}

interface Role {
  id: string;
  name: string;
  color: string;
}

const Members: React.FC<MembersProps> = ({ serverId, onUpdate, userId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [assigningRole, setAssigningRole] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastMemberRef = useRef<HTMLDivElement | null>(null);
  const BATCH_SIZE = 70;
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchMembers = async (afterId?: string) => {
    if (loadingMembers || fetchingMore || !hasMore) return;
    setLoadingMembers(true);
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/members/fetch`,
        { limit: BATCH_SIZE, afterId },
        { withCredentials: true }
      );
      const newMembers = res.data.members || [];
      setMembers((prev) => (afterId ? [...prev, ...newMembers] : newMembers));
      setHasMore(newMembers.length === BATCH_SIZE);
    } catch (err: any) {
      if (!afterId) setMembers([]);
      setError(err.response.data.message);
    } finally {
      setLoadingMembers(false);
      setFetchingMore(false);
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
    setMembers([]);
    setHasMore(true);
    fetchMembers();
    fetchRoles();
  }, [serverId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setRoleDropdownOpen(false);
      }
    }
    if (roleDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roleDropdownOpen]);

  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === userId) return -1;
    if (b.id === userId) return 1;
    return 0;
  });

  const filteredMembers = searchTerm
    ? sortedMembers.filter(
        (member) =>
          member.display_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          member.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sortedMembers;

  const handleAssignRole = async () => {
    if (!selectedMember || !selectedRole) return;
    setAssigningRole(true);
    setError("");
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/roles/assign`,
        {
          userId: selectedMember.id,
          role: selectedRole,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
      } else {
        setError(error.response.data.message);
      }
    }
    setAssigningRole(false);
  };

  const handleRemoveRole = async (memberId: string, roleId: string) => {
    if (!memberId || !roleId) return;
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/roles/remove`,
        {
          userId: memberId,
          role: roleId,
        },
        { withCredentials: true }
      );
      setMembers([]);
      setHasMore(true);
      fetchMembers();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data);
        setError(err.response.data.message);
      } else {
        setError(err.response.data.message);
      }
    }
  };

  const handleKickMember = async (memberId: string) => {
    if (!memberId) return;
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/members/kick`,
        {
          kickee: memberId,
        },
        { withCredentials: true }
      );
      setMembers([]);
      setHasMore(true);
      fetchMembers();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data);
        setError(err.response.data.message);
      } else {
        setError(err.response.data.message);
      }
    }
  };

  const handleBanMember = async (memberId: string) => {
    if (!memberId) return;
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/members/ban`,
        {
          banee: memberId,
        },
        { withCredentials: true }
      );
      setMembers([]);
      setHasMore(true);
      fetchMembers();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data);
        setError(err.response.data.message);
      } else {
        setError(err.response.data.message);
      }
    }
  };

  const lastMemberElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMembers || fetchingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && members.length > 0) {
          setFetchingMore(true);
          fetchMembers(members[members.length - 1].id);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMembers, fetchingMore, hasMore, members]
  );

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
          {filteredMembers.map((member, index) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-[#2a2b2e]"
              ref={
                index === filteredMembers.length - 1
                  ? lastMemberElementRef
                  : null
              }
            >
              <div className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full bg-[#2a2b2e] flex items-center justify-center border-2 border-[#3a3b3e] flex-shrink-0">
                {member.pfp ? (
                  <img
                    src={
                      member.pfp.startsWith("/uploads/")
                        ? `http://localhost:3000${member.pfp}`
                        : member.pfp
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-gray-500 font-bold">
                    {(
                      member.display_name?.[0] ||
                      member.username?.[0] ||
                      "?"
                    ).toUpperCase()}
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
                    {member.roles.map((roleId: string) => {
                      const role = roles.find((r) => r.id === roleId);
                      if (!role) return null;
                      return (
                        <div
                          key={role.id}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-[#2a2b2e] border border-[#3a3b3e]"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: role.color || "#5865F2" }}
                          />
                          <span className="text-xs text-white">
                            {role.name}
                          </span>
                          <button
                            onClick={() => handleRemoveRole(member.id, role.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-col sm:flex-row flex-wrap">
                <button
                  className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded font-semibold text-xs shadow transition-colors"
                  onClick={() => setSelectedMember(member)}
                >
                  Assign Role
                </button>
                {member.id !== userId && (
                  <>
                    <button
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-semibold text-xs shadow transition-colors"
                      onClick={() => handleKickMember(member.id)}
                    >
                      Kick
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-xs shadow transition-colors"
                      onClick={() => handleBanMember(member.id)}
                    >
                      Ban
                    </button>
                  </>
                )}
              </div>
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
                <div className="relative" ref={roleDropdownRef}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={() => setRoleDropdownOpen((open) => !open)}
                  >
                    {selectedRole ? (
                      <span className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full inline-block border border-[#23232a]"
                          style={{
                            background:
                              roles.find((r) => r.id === selectedRole)?.color ||
                              "#5865F2",
                          }}
                        />
                        {roles.find((r) => r.id === selectedRole)?.name ||
                          "Choose a role..."}
                      </span>
                    ) : (
                      <span className="text-gray-400">Choose a role...</span>
                    )}
                    <svg
                      className="w-4 h-4 ml-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {roleDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-[#23232a] border border-[#23232a] rounded shadow-lg max-h-60 overflow-y-auto">
                      {roles.length === 0 && (
                        <div className="px-4 py-2 text-gray-400">
                          No roles found.
                        </div>
                      )}
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-[#18191c] transition-colors ${
                            selectedRole === role.id ? "bg-[#18191c]" : ""
                          }`}
                          onClick={() => {
                            setSelectedRole(role.id);
                            setRoleDropdownOpen(false);
                          }}
                        >
                          <span
                            className="w-4 h-4 rounded-full inline-block border border-[#23232a]"
                            style={{ background: role.color || "#5865F2" }}
                          />
                          <span className="text-white">{role.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
