import { useState, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface Role {
  name: string;
  role_id: string;
  color: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  channelId: string;
}

const NewPermissionModal = (props: Props) => {
  const [search, setSearch] = useState("");
  const { id } = useParams();

  // filter roles by search
  const filtered = useMemo(
    () =>
      props.roles.filter((r) =>
        r.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [props.roles, search]
  );

  const onAdd = async (role_id: string) => {
    if (!role_id) return;
    try {
      if (!props.channelId) return;
      const response = await axios.post(
        `http://localhost:3000/servers/${id}/channels/${props.channelId}/permissions/new`,
        { role_id },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.valid) {
        props.onClose();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  if (!props.isOpen) return null;
  return (
    <div className="absolute top-0 left-full w-64 h-full bg-[#2a2b2e] border-1 border-[#3a3b3e] shadow-lg z-50 flex flex-col rounded">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h4 className="text-white font-semibold">Add Role Override</h4>
        <button
          onClick={props.onClose}
          className="text-gray-400 hover:text-white"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <input
          type="text"
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1 bg-[#2a2b2e] border-1 border-[#1e1e20] text-white rounded focus:outline-none"
        />
      </div>

      {/* Scrollable Role List */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {filtered.map((r) => (
          <div
            key={r.role_id}
            onClick={() => onAdd(r.role_id)}
            className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-white">{r.name}</span>
            </div>
            <span className="text-gray-400">Add</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-4">
            No roles found.
          </p>
        )}
      </div>
    </div>
  );
};

export default NewPermissionModal;
