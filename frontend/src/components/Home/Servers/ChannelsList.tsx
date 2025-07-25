import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import plusIcon from "../../../assets/plus.svg";
import cogIcon from "../../../assets/cog.svg";
import { FaChevronDown } from "react-icons/fa";
import { FaHashtag, FaVolumeUp } from "react-icons/fa";
import leaveIcon from "../../../assets/leave.svg";
import ConfirmServerLeave from "./ConfirmServerLeave";
import inviteIcon from "../../../assets/friends.svg";
import InviteModal from "./InviteModal";

interface ChannelInfo {
  name: string;
  id: string;
  type: string;
  category: string;
  unreadCount: number;
}

interface CategoryWithChannels {
  categoryName: string;
  category: string;
  channels: ChannelInfo[];
}

interface Props {
  openSettings: React.Dispatch<React.SetStateAction<string | null>>;
  isOpen: boolean;
  closeSettings: () => void;
  serverName: string;
  onOpenCreateCategory: () => void;
  onOpenCreateChannel: (categoryId: string) => void;
  onOpenServerSettings: () => void;
}

const ChannelsList = (props: Props) => {
  const { id } = useParams();
  const location = useLocation();
  const [categories, setCategories] = useState<CategoryWithChannels[] | null>(
    null
  );
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<{ [cat: string]: boolean }>({});
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Get selected channel from URL
  const searchParams = new URLSearchParams(location.search);
  const selectedChannel = searchParams.get("channel");

  const onMount = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/servers/${id}/channels`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setCategories(response.data.channelsData);
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
    onMount();
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="w-72 bg-[#18191c] border-r border-[#23232a] p-4 flex flex-col space-y-4 shadow-2xl">
      {/* Server Top Bar */}
      <div className="flex items-center justify-between w-full mb-2 px-1 select-none">
        <span
          className="text-lg font-extrabold text-white truncate tracking-wide"
          title={props.serverName}
        >
          {props.serverName}
        </span>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="p-1 rounded hover:bg-[#23232a] transition"
            title="Server Options"
          >
            <FaChevronDown
              className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[#23232a] border border-gray-800 rounded shadow-lg z-50 animate-fade-in">
              <button
                className="w-full text-left px-4 py-2 text-gray-100 hover:bg-[#23232a]/80 rounded transition font-semibold border-b border-[#23232a] flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  props.onOpenServerSettings();
                }}
              >
                Server Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 text-gray-100 hover:bg-[#23232a]/80 rounded transition font-semibold border-b border-[#23232a] flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  props.onOpenCreateCategory();
                }}
              >
                + Create Category
              </button>
              <button
                className="w-full text-left px-4 py-2 text-green-400 hover:bg-[#23232a]/80 rounded transition font-semibold flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);

                  setInviteModalOpen(true);
                }}
              >
                <img src={inviteIcon} alt="Invite" className="w-4 h-4 mr-2" />{" "}
                Invite
              </button>
              <button
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#23232a]/80 rounded transition font-semibold flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  setLeaveModalOpen(true);
                }}
              >
                <img src={leaveIcon} alt="Leave" className="w-4 h-4 mr-2" />{" "}
                Leave Server
              </button>
            </div>
          )}
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto space-y-3 pr-1">
        {categories?.map((cat) => (
          <li key={cat.category} className="mb-2">
            {/* Category Header */}
            <div
              className="flex items-center justify-between px-2 py-1 rounded bg-[#23232a] hover:bg-[#23232a]/80 transition cursor-pointer group border border-[#23232a] shadow-sm"
              onClick={() =>
                setCollapsed((prev) => ({
                  ...prev,
                  [cat.category]: !prev[cat.category],
                }))
              }
            >
              <div className="flex items-center gap-2">
                <FaChevronDown
                  className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                    collapsed[cat.category] ? "-rotate-90" : ""
                  }`}
                />
                <span className="text-xs font-bold text-gray-200 uppercase tracking-wider select-none">
                  {cat.categoryName}
                </span>
              </div>
              <img
                src={plusIcon}
                className="cursor-pointer w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 hover:scale-110 transition-transform"
                title="Add Channel"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onOpenCreateChannel(cat.category);
                }}
              />
            </div>
            {/* Channels List */}
            {!collapsed[cat.category] && (
              <ul className="space-y-1 mt-1">
                {cat.channels.map((chan) => (
                  <li
                    key={chan.id}
                    className={`flex items-center group px-3 py-2 rounded cursor-pointer transition-all duration-150 relative
                      ${
                        selectedChannel === chan.id
                          ? "bg-[#23232a] border-l-4 border-white/80 shadow-lg"
                          : "hover:bg-[#23232a]/80 hover:border-l-4 hover:border-gray-500/60 hover:shadow-md"
                      }
                      text-gray-100`}
                    onClick={() => {
                      navigate(`/home/servers/${id}?channel=${chan.id}`);
                    }}
                    title={chan.name}
                  >
                    {/* Icon based on type */}
                    {chan.type === "voice" ? (
                      <FaVolumeUp className="mr-2 text-gray-400 w-5 h-5" />
                    ) : (
                      <FaHashtag className="mr-2 text-gray-400 w-5 h-5" />
                    )}
                    <span className="truncate flex-1 font-medium tracking-wide flex items-center">
                      {chan.type === "text" && chan.unreadCount > 0 && (
                        <span
                          className="w-2 h-2 rounded-full bg-white mr-2 inline-block shadow-md"
                          title="Unread"
                        />
                      )}
                      {chan.name}
                    </span>
                    <img
                      src={cogIcon}
                      className={`cursor-pointer w-4 h-4 ml-auto transition-transform duration-200
                        ${
                          selectedChannel === chan.id
                            ? "opacity-100 rotate-12"
                            : "opacity-0 group-hover:opacity-100 group-hover:rotate-12"
                        }
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        props.openSettings(chan.id);
                      }}
                      title="Channel Settings"
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <ConfirmServerLeave
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        serverId={id || ""}
        serverName={props.serverName}
      />
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        serverId={id || ""}
      />
    </nav>
  );
};

export default ChannelsList;
