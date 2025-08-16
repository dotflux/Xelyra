import React, { useState, useEffect } from "react";
import axios from "axios";

interface RolesProps {
  serverId: string;
  onUpdate: () => void;
}

const ALL_PERMISSIONS = [
  "VIEW_CHANNEL",
  "SEND_MESSAGES",
  "MANAGE_MESSAGES",
  "MANAGE_CHANNELS",
  "MANAGE_ROLES",
  "BAN_USERS",
  "KICK_USERS",
  "ADMIN",
];

const Roles: React.FC<RolesProps> = ({ serverId }) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    color: "#5865F2",
    template: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manageRole, setManageRole] = useState<any | null>(null);
  const [manageRoleState, setManageRoleState] = useState<any | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    setRolesError(null);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/roles/fetch`,
        {},
        { withCredentials: true }
      );
      setRoles(res.data.roles || res.data);
    } catch (err: any) {
      setRoles([]);
      setRolesError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to fetch roles."
      );
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [serverId]);

  useEffect(() => {
    if (manageRole) {
      setManageRoleState({
        name: manageRole.name,
        color: manageRole.color,
        permissions: Array.isArray(manageRole.permissions)
          ? manageRole.permissions
          : [],
      });
    } else {
      setManageRoleState(null);
    }
  }, [manageRole]);

  const handleCreateRole = async () => {
    setCreating(true);
    try {
      await axios.post(
        `http://localhost:3000/servers/${serverId}/roles/create`,
        {
          name: newRole.name,
          color: newRole.color,
          template: newRole.template,
          permissions: [],
        },
        { withCredentials: true }
      );
      setShowCreateRole(false);
      setNewRole({ name: "", color: "#5865F2", template: "" });
      fetchRoles();
    } catch {
      setError("Failed to create role");
    }
    setCreating(false);
  };

  const handleRoleField = (field: string, value: any) => {
    setManageRoleState((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (perm: string) => {
    setManageRoleState((prev: any) => {
      const has = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p: string) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const handleSaveRole = async () => {
    if (!manageRole || !manageRoleState) return;
    setSavingRole(true);
    try {
      const nameChanged = manageRoleState.name !== manageRole.name;
      const colorChanged = manageRoleState.color !== manageRole.color;
      const permissionsChanged =
        Array.isArray(manageRoleState.permissions) &&
        JSON.stringify([...manageRoleState.permissions].sort()) !==
          JSON.stringify([...(manageRole.permissions || [])].sort());

      if (nameChanged) {
        await axios.post(
          `http://localhost:3000/servers/${serverId}/roles/rename`,
          { serverId, roleId: manageRole.id, newName: manageRoleState.name },
          { withCredentials: true }
        );
      }

      if (colorChanged) {
        await axios.post(
          `http://localhost:3000/servers/${serverId}/roles/color`,
          { serverId, roleId: manageRole.id, color: manageRoleState.color },
          { withCredentials: true }
        );
      }

      if (permissionsChanged) {
        await axios.post(
          `http://localhost:3000/servers/${serverId}/roles/permissions`,
          {
            serverId,
            roleId: manageRole.id,
            permissions: manageRoleState.permissions,
          },
          { withCredentials: true }
        );
      }

      fetchRoles();
      setManageRole(null);
    } catch (err) {
      setError("Failed to save role");
    }
    setSavingRole(false);
  };

  const roleChanged =
    manageRole &&
    manageRoleState &&
    (manageRoleState.name !== manageRole.name ||
      manageRoleState.color !== manageRole.color ||
      JSON.stringify([...manageRoleState.permissions].sort()) !==
        JSON.stringify([...(manageRole.permissions || [])].sort()));

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Roles</h3>
        <button
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition-colors"
          onClick={() => setShowCreateRole(true)}
        >
          + Create Role
        </button>
      </div>

      {rolesError && (
        <div className="text-red-400 font-semibold mb-4">{rolesError}</div>
      )}

      {loadingRoles ? (
        <div className="text-gray-500">Loading roles...</div>
      ) : roles.length === 0 ? (
        <div className="text-gray-400 mb-4">
          No roles found. Create the first role!
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role: any) => (
            <div
              key={role.id}
              className="flex items-center gap-3 p-4 rounded-lg bg-[#1e1f22] border border-[#3a3b3e]"
            >
              <span
                className="w-4 h-4 rounded-full inline-block"
                style={{ background: role.color || "#5865F2" }}
              />
              <span className="text-white font-semibold text-sm flex-1">
                {role.name}
              </span>
              <span className="text-xs text-gray-400">
                {role.template || "Custom"}
              </span>
              <button
                className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded font-semibold text-xs shadow transition-colors"
                onClick={() => setManageRole(role)}
              >
                Manage Role
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#202127] rounded-lg shadow-xl p-8 w-full max-w-sm relative">
            <button
              onClick={() => setShowCreateRole(false)}
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
            <h4 className="text-lg font-bold text-white mb-4">Create Role</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole((r) => ({ ...r, name: e.target.value }))
                  }
                  placeholder="Role name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  className="w-full h-10 rounded bg-[#18191c] border border-[#23232a]"
                  value={newRole.color}
                  onChange={(e) =>
                    setNewRole((r) => ({ ...r, color: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors"
                  onClick={handleCreateRole}
                  disabled={!newRole.name || creating}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded font-semibold transition-colors"
                  onClick={() => setShowCreateRole(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Role Modal */}
      {manageRole && manageRoleState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#202127] rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white">
                Manage Role: {manageRole.name}
              </h4>
              <button
                onClick={() => setManageRole(null)}
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

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={manageRoleState.name}
                  onChange={(e) => handleRoleField("name", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  className="w-full h-10 rounded bg-[#18191c] border border-[#23232a]"
                  value={manageRoleState.color}
                  onChange={(e) => handleRoleField("color", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center gap-2 p-3 rounded bg-[#18191c] border border-[#23232a] cursor-pointer hover:bg-[#23232a] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={manageRoleState.permissions.includes(perm)}
                        onChange={() => handlePermissionToggle(perm)}
                        className="rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-white">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
                  onClick={handleSaveRole}
                  disabled={!roleChanged || savingRole}
                >
                  {savingRole ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded font-semibold transition-colors"
                  onClick={() => setManageRole(null)}
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

export default Roles;
