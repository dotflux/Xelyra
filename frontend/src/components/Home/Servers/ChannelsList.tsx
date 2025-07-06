import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import plusIcon from "../../../assets/plus.svg";
import CreateChannel from "./CreateChannel";
import cogIcon from "../../../assets/cog.svg";
import vcIcon from "../../../assets/vc.svg";
import CreateCategory from "./CreateCategory";
import { FaChevronDown } from "react-icons/fa";

interface ChannelInfo {
  name: string;
  id: string;
  type: string;
  category: string;
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
}

const ChannelsList = (props: Props) => {
  const { id } = useParams();
  const location = useLocation();
  const [categories, setCategories] = useState<CategoryWithChannels[] | null>(
    null
  );
  const [createOpen, setCreateOpen] = useState<null | string>(null); // store category id for which modal is open
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <nav className="w-72 bg-[#1e1f22] border-r border-[#2a2b2e] p-4 flex flex-col space-y-4 shadow-inner">
      {/* Server Top Bar */}
      <div className="flex items-center justify-between w-full mb-2 px-1 select-none">
        <span
          className="text-base font-bold text-white truncate"
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
            <FaChevronDown className="text-gray-400 w-4 h-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[#23232a] border border-gray-700 rounded shadow-lg z-50 animate-fade-in">
              <button
                className="w-full text-left px-4 py-2 text-gray-200 hover:bg-[#2a2b2e] rounded transition"
                onClick={() => {
                  setDropdownOpen(false);
                  setCreateCategoryOpen(true);
                }}
              >
                + Create Category
              </button>
            </div>
          )}
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto space-y-2">
        {categories?.map((cat) => (
          <li key={cat.category} className="mb-2">
            {/* Category Header */}
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide select-none">
                {cat.categoryName}
              </span>
              <img
                src={plusIcon}
                className="cursor-pointer w-4 h-4 ml-2"
                title="Add Channel"
                onClick={() => setCreateOpen(cat.category)}
              />
            </div>
            {/* Channels List */}
            <ul className="space-y-1">
              {cat.channels.map((chan) => (
                <li
                  key={chan.id}
                  className={`flex items-center group px-2 py-1 rounded cursor-pointer transition ${
                    selectedChannel === chan.id
                      ? "bg-[#2a2b2e] border border-gray-700"
                      : "hover:bg-[#2a2b2e]"
                  } text-gray-300`}
                  onClick={() => {
                    navigate(`/home/servers/${id}?channel=${chan.id}`);
                  }}
                >
                  {/* Icon based on type */}
                  {chan.type === "voice" ? (
                    <span className="mr-2 flex items-center">
                      <img src={vcIcon} alt="vc" className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="mr-2 text-lg">#</span>
                  )}
                  <span className="truncate flex-1">{chan.name}</span>
                  <img
                    src={cogIcon}
                    className={`cursor-pointer w-4 h-4 ml-auto transition-opacity duration-150
                      ${
                        selectedChannel === chan.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    title="Channel Settings"
                    onClick={(e) => {
                      e.stopPropagation();
                      props.openSettings(chan.id);
                    }}
                  />
                </li>
              ))}
            </ul>
            {/* Create Channel Modal for this category */}
            {createOpen === cat.category && (
              <CreateChannel
                isOpen={true}
                onClose={() => setCreateOpen(null)}
                categoryId={cat.category}
              />
            )}
          </li>
        ))}
      </ul>
      {createCategoryOpen && (
        <CreateCategory
          isOpen={createCategoryOpen}
          onClose={() => setCreateCategoryOpen(false)}
        />
      )}
    </nav>
  );
};

export default ChannelsList;
