import plusIcon from "../../../../assets/plus.svg";
import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import deepEqual from "fast-deep-equal";
import NewPermissionModal from "./NewPermissionModal";

interface Overwrite {
  targetName: string;
  targetId: string;
  allow: string[];
  deny: string[];
}

interface Role {
  name: string;
  role_id: string;
  color: string;
}

interface Props {
  channelId: string;
  permissions: Overwrite[];
  roles: Role[];
}

type Permission =
  | "VIEW_CHANNEL"
  | "SEND_MESSAGES"
  | "MANAGE_MESSAGES"
  | "MANAGE_CHANNELS"
  | "MANAGE_ROLES";

const PERMISSIONS: Permission[] = [
  "VIEW_CHANNEL",
  "SEND_MESSAGES",
  "MANAGE_MESSAGES",
  "MANAGE_CHANNELS",
  "MANAGE_ROLES",
];

const Permissions = ({ channelId, permissions, roles }: Props) => {
  const { id } = useParams();

  const [selectedRole, setSelectedRole] = useState(
    permissions.length > 0 ? permissions[0].targetId : null
  );
  const [overwrites, setOverwrites] = useState<Overwrite[]>(permissions);
  const [savedOverwrites, setSavedOverwrites] =
    useState<Overwrite[]>(permissions);

  const current = overwrites.find((o) => o.targetId === selectedRole);

  const [showNew, setShowNew] = useState(false);

  const setPermission = (
    perm: Permission,
    state: "allow" | "deny" | "neutral"
  ) => {
    setOverwrites((prev) =>
      prev.map((o) => {
        if (o.targetId !== selectedRole) return o;

        const allow = new Set(o.allow);
        const deny = new Set(o.deny);

        // Determine current state
        const currentState = allow.has(perm)
          ? "allow"
          : deny.has(perm)
          ? "deny"
          : "neutral";

        // ✅ If user clicked the current state, no need to update
        if (currentState === state) return o;

        // Clear from both sets
        allow.delete(perm);
        deny.delete(perm);

        // Apply new state
        if (state === "allow") allow.add(perm);
        if (state === "deny") deny.add(perm);

        return { ...o, allow: [...allow], deny: [...deny] };
      })
    );
  };

  const normalize = (list: Overwrite[]) =>
    list.map((o) => ({
      ...o,
      allow: Array.isArray(o.allow) ? [...o.allow].sort() : [],
      deny: Array.isArray(o.deny) ? [...o.deny].sort() : [],
    }));

  const isDirty = !deepEqual(normalize(savedOverwrites), normalize(overwrites));

  const handleSave = async () => {
    const updates = overwrites
      .map((o) => {
        const original = permissions.find((p) => p.targetId === o.targetId);
        if (
          !original ||
          !deepEqual(original.allow, o.allow) ||
          !deepEqual(original.deny, o.deny)
        ) {
          return {
            role: o.targetId,
            allow: o.allow,
            deny: o.deny,
          };
        }
        return null;
      })
      .filter(
        (u): u is { role: string; allow: string[]; deny: string[] } => !!u
      );

    console.log("Computed updates:", updates);

    if (updates.length === 0) {
      console.log("No actual changes detected.");
      return;
    }

    try {
      if (!channelId || !id) return;
      const response = await axios.post(
        `http://localhost:3000/servers/${id}/channels/${channelId}/permissions/assign`,
        { updates },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.valid) {
        setSavedOverwrites(normalize(overwrites));
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  if (!current) {
    return (
      <div className="flex-1 p-6 text-white">
        <p>No role selected or found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Roles List */}
      <aside className="relative w-64 text-gray-300">
        {/* Header */}
        <div className="flex">
          <h3 className="p-4 font-semibold">Roles</h3>
          <img
            src={plusIcon}
            className="ml-auto mr-4 mt-4 h-5 w-5 cursor-pointer"
            onClick={() => setShowNew(true)}
          />
        </div>

        {/* Wrapper that holds both list and modal */}
        <div className="relative h-[calc(100%-3.5rem)]">
          {" "}
          {/* 3.5rem accounts for header height */}
          {/* Roles List */}
          <ul className="z-0 relative h-full overflow-y-auto pr-1">
            {overwrites.map((o) => (
              <li
                key={o.targetId}
                onClick={() => setSelectedRole(o.targetId)}
                className={`px-4 py-2 cursor-pointer ${
                  o.targetId === selectedRole
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-700"
                }`}
              >
                {o.targetName}
              </li>
            ))}
          </ul>
          {/* Modal absolutely positioned in same stacking context */}
          {showNew && (
            <NewPermissionModal
              isOpen={showNew}
              onClose={() => setShowNew(false)}
              roles={roles.filter(
                (role) => !overwrites.some((o) => o.targetId === role.role_id)
              )}
              channelId={channelId}
            />
          )}
        </div>
      </aside>

      {/* Permissions Grid */}
      <main className="flex-1 p-6 text-white overflow-auto">
        <h3 className="mb-4 text-xl font-semibold">
          Permissions for {current.targetName}
        </h3>
        <div className="flex flex-col gap-4">
          {PERMISSIONS.map((perm) => {
            const state = (current.allow || []).includes(perm)
              ? "allow"
              : (current.deny || []).includes(perm)
              ? "deny"
              : "neutral";
            return (
              <div key={perm} className="flex justify-between items-center p-3">
                <span>{perm.replace("_", " ")}</span>
                <div className="flex space-x-2">
                  {/* Deny */}
                  <button
                    onClick={() => setPermission(perm, "deny")}
                    className={`p-1 rounded ${
                      state === "deny" ? "bg-red-600" : "hover:bg-gray-700"
                    }`}
                  >
                    X
                  </button>
                  {/* Neutral */}
                  <button
                    onClick={() => setPermission(perm, "neutral")}
                    className={`p-1 rounded ${
                      state === "neutral" ? "bg-gray-600" : "hover:bg-gray-700"
                    }`}
                  >
                    /
                  </button>
                  {/* Allow */}
                  <button
                    onClick={() => setPermission(perm, "allow")}
                    className={`p-1 rounded ${
                      state === "allow" ? "bg-green-600" : "hover:bg-gray-700"
                    }`}
                  >
                    ✓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      {isDirty && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#2a2b2e] border border-[#3a3b3e] text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 max-w-xl w-[95%]">
          <span>Unsaved changes were detected</span>
          <button
            className="text-sm text-gray-300 hover:underline"
            onClick={() => setOverwrites(savedOverwrites)}
          >
            Reset
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default Permissions;
