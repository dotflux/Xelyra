import React, { useState, useEffect } from "react";
import axios from "axios";

const TABS = ["Overview", "Roles", "Audit Log"];
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

function ServerSettingsOverlay({
  serverId,
  isOpen,
  onClose,
}: {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("Overview");
  const [serverInfo, setServerInfo] = useState<any>(null);
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
  const [serverEdit, setServerEdit] = useState<any | null>(null);
  const [savingServer, setSavingServer] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (tab === "Overview") {
      axios
        .post(
          `http://localhost:3000/servers/${serverId}`,
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((res) => {
          setServerInfo(res.data.serverInfo || res.data);
          setError(null);
        })
        .catch((err) => {
          console.error("Server info fetch error:", err, err?.response?.data);
          setServerInfo(null);
          setError(
            err?.response?.data?.error ||
              err?.response?.data?.message ||
              "Failed to fetch server info."
          );
        });
    } else if (tab === "Roles") {
      setLoadingRoles(true);
      setRolesError(null);
      axios
        .post(
          `http://localhost:3000/servers/${serverId}/roles/fetch`,
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((res) => setRoles(res.data.roles || res.data))
        .catch((err) => {
          setRoles([]);
          setRolesError(
            err?.response?.data?.error ||
              err?.response?.data?.message ||
              "Failed to fetch roles."
          );
        })
        .finally(() => setLoadingRoles(false));
    }
  }, [isOpen, tab, serverId]);

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

  useEffect(() => {
    if (serverInfo) {
      setServerEdit({
        name: serverInfo.name || "",
        description: serverInfo.description || "",
      });
    }
  }, [serverInfo]);

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
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setShowCreateRole(false);
      setNewRole({ name: "", color: "#5865F2", template: "" });
      // Refresh roles
      setLoadingRoles(true);
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/roles/fetch`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setRoles(res.data.roles || res.data);
    } catch {
      // handle error
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
      // Rename if changed
      if (manageRoleState.name !== manageRole.name) {
        await axios.post(
          `http://localhost:3000/servers/${serverId}/roles/rename`,
          { serverId, roleId: manageRole.id, newName: manageRoleState.name },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      // Color if changed
      if (manageRoleState.color !== manageRole.color) {
        await axios.post(
          `http://localhost:3000/servers/${serverId}/roles/color`,
          { serverId, roleId: manageRole.id, color: manageRoleState.color },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      // Permissions if changed
      if (
        Array.isArray(manageRoleState.permissions) &&
        JSON.stringify([...manageRoleState.permissions].sort()) !==
          JSON.stringify([...(manageRole.permissions || [])].sort())
      ) {
        await axios.post(
          `http://localhost:3000/servers/${serverId}/roles/permissions`,
          {
            serverId,
            roleId: manageRole.id,
            permissions: manageRoleState.permissions,
          },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      // Refresh roles
      setLoadingRoles(true);
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/roles/fetch`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setRoles(res.data.roles || res.data);
      setManageRole(null);
    } catch (err) {
      // Optionally show error
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

  const handleServerField = (field: string, value: any) => {
    setServerEdit((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveServer = async () => {
    if (!serverEdit) return;
    setSavingServer(true);
    setServerError(null);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${serverId}/update`,
        { name: serverEdit.name },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.data?.valid) {
        setServerInfo((prev: any) => ({ ...prev, name: serverEdit.name }));
      } else {
        setServerError(
          res.data?.error ||
            res.data?.message ||
            "Failed to update server name."
        );
      }
    } catch (err: any) {
      setServerError(
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
  };

  const serverChanged =
    serverEdit &&
    (serverEdit.name !== serverInfo?.name ||
      serverEdit.description !== (serverInfo?.description || ""));

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
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.data?.pfp) {
        setServerInfo((prev: any) => ({ ...prev, pfp: res.data.pfp }));
      }
    } catch (err) {
      // Optionally show error
    }
    setUploadingPfp(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex bg-black/80">
      {/* Sidebar */}
      <div className="w-72 h-full bg-[#18191c] border-r border-[#23232a] flex flex-col py-8 px-4 shadow-2xl relative">
        <div className="flex flex-col items-center mb-10 select-none">
          <div className="w-20 h-20 rounded-2xl bg-[#23232a] flex items-center justify-center mb-3 border-2 border-[#23232a] shadow-lg overflow-hidden">
            {uploadingPfp ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-indigo-400 animate-pulse">
                  Uploading...
                </span>
              </div>
            ) : serverInfo?.pfp ? (
              <img
                src={serverInfo.pfp}
                alt="Server Icon"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl text-gray-500 font-bold">
                {serverInfo?.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="text-lg font-bold text-white mb-1 truncate w-full text-center">
            {serverInfo?.name || "Server"}
          </div>
          <div className="text-xs text-gray-400 mb-2 text-center w-full truncate">
            ID: {serverInfo?.id || "-"}
          </div>
        </div>
        <nav className="flex flex-col gap-2 mt-2">
          {TABS.map((t) => (
            <button
              key={t}
              className={`text-left px-5 py-3 rounded-xl font-semibold transition-all text-base tracking-wide select-none flex items-center gap-3
                ${
                  tab === t
                    ? "bg-gradient-to-r from-indigo-700/80 to-indigo-500/60 text-white shadow-lg border-l-4 border-indigo-400 scale-[1.04]"
                    : "text-gray-400 hover:text-white hover:bg-[#23232a]/80 hover:scale-[1.02]"
                }
              `}
              onClick={() => setTab(t)}
            >
              {/* Optionally add icons here for each tab */}
              {t}
            </button>
          ))}
        </nav>
        <button
          onClick={onClose}
          className="mt-auto mb-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#23232a] rounded-lg transition-colors font-semibold"
        >
          Close
        </button>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-700/60 to-indigo-400/30 rounded-t-xl" />
      </div>
      {/* Main Content */}
      <div className="flex-1 h-full bg-[#202127] flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#23232a]">
          <h3 className="text-xl font-bold text-white">{tab}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Close"
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
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {tab === "Overview" && (
            <div className="max-w-xl mx-auto bg-[#23232a] rounded-2xl shadow-xl p-8 border border-[#23232a] flex flex-col gap-6">
              {serverError && (
                <div className="text-red-400 font-semibold mb-4">
                  {serverError}
                </div>
              )}
              {error ? (
                <div className="text-red-400 font-semibold mb-4">{error}</div>
              ) : serverInfo ? (
                <>
                  <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-[#18191c] flex items-center justify-center border-2 border-indigo-700 shadow-lg overflow-hidden relative group">
                      {uploadingPfp ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-indigo-400 animate-pulse">
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
                        <span className="text-5xl text-gray-500 font-bold">
                          {serverInfo.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                      <label className="absolute bottom-2 right-2 bg-black/70 rounded-full p-1 cursor-pointer hover:bg-indigo-700 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleIconChange}
                        />
                        <svg
                          className="w-5 h-5 text-white"
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
                  </div>
                  <form className="flex flex-col gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">
                        Server Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold"
                        value={serverEdit?.name || ""}
                        onChange={(e) =>
                          handleServerField("name", e.target.value)
                        }
                        placeholder="Server name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={serverEdit?.description || ""}
                        onChange={(e) =>
                          handleServerField("description", e.target.value)
                        }
                        placeholder="Add a description..."
                      />
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button
                        type="button"
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow transition-colors"
                        onClick={handleSaveServer}
                        disabled={!serverChanged || savingServer}
                      >
                        {savingServer ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded-lg font-semibold shadow transition-colors"
                        onClick={handleResetServer}
                        disabled={savingServer}
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-gray-500">Loading...</div>
              )}
            </div>
          )}
          {tab === "Roles" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Roles</h3>
                <button
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-sm shadow"
                  onClick={() => setShowCreateRole(true)}
                >
                  + Create Role
                </button>
              </div>
              {rolesError && (
                <div className="text-red-400 font-semibold mb-2">
                  {rolesError}
                </div>
              )}
              {loadingRoles ? (
                <div className="text-gray-500">Loading roles...</div>
              ) : roles.length === 0 ? (
                <div className="text-gray-400 mb-4">
                  No roles found. Create the first role!
                </div>
              ) : (
                <ul className="space-y-2 mb-4">
                  {roles.map((role: any) => (
                    <li
                      key={role.id}
                      className="flex items-center gap-3 p-3 rounded bg-[#23232a] border border-[#23232a]"
                    >
                      <span
                        className="w-4 h-4 rounded-full inline-block mr-2"
                        style={{ background: role.color || "#5865F2" }}
                      />
                      <span className="text-white font-semibold text-sm">
                        {role.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {role.template || "Custom"}
                      </span>
                      <button
                        className="ml-4 px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded font-semibold text-xs shadow transition-colors"
                        onClick={() => setManageRole(role)}
                      >
                        Manage Role
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {tab === "Audit Log" && (
            <div className="text-gray-400">
              Audit Log is not implemented yet.
            </div>
          )}
        </div>
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
              <div className="mb-3">
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
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer"
                  value={newRole.color}
                  onChange={(e) =>
                    setNewRole((r) => ({ ...r, color: e.target.value }))
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Template
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newRole.template}
                  onChange={(e) =>
                    setNewRole((r) => ({ ...r, template: e.target.value }))
                  }
                  placeholder="Template (optional)"
                />
              </div>
              <button
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-sm shadow mt-2"
                onClick={handleCreateRole}
                disabled={creating || !newRole.name.trim()}
              >
                {creating ? "Creating..." : "Create Role"}
              </button>
            </div>
          </div>
        )}
        {/* Manage Role Modal */}
        {manageRole && manageRoleState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#202127] rounded-lg shadow-xl p-8 w-full max-w-md relative">
              <button
                onClick={() => setManageRole(null)}
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
              <h4 className="text-lg font-bold text-white mb-4">Manage Role</h4>
              <form className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
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
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer"
                    value={manageRoleState.color}
                    onChange={(e) => handleRoleField("color", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label
                        key={perm}
                        className="flex items-center gap-2 text-gray-200 text-sm cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={manageRoleState.permissions.includes(perm)}
                          onChange={() => handlePermissionToggle(perm)}
                          className="accent-indigo-600 w-4 h-4"
                        />
                        {perm
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow transition-colors disabled:opacity-60"
                    onClick={handleSaveRole}
                    disabled={!roleChanged || savingRole}
                  >
                    {savingRole ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded-lg font-semibold shadow transition-colors"
                    onClick={() => setManageRole(null)}
                    disabled={savingRole}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServerSettingsOverlay;
