type TabKey = "overview" | "permissions";

interface Props {
  channelName: string | null;
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "permissions", label: "Permissions" },
  // add more here
];

import openSidebarIcon from "../../../../assets/openSidebar.svg";
import closeSidebarIcon from "../../../../assets/closeSidebar.svg";
import { useState } from "react";

const ChannelSidebar = (props: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="absolute top-4 left-4 z-50 sm:hidden bg-[#23232a] p-2 rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(true)}
        style={{ display: sidebarOpen ? "none" : undefined }}
      >
        <img src={openSidebarIcon} alt="Open Sidebar" className="w-6 h-6" />
      </button>
      {/* Sidebar */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/70 transition-opacity duration-200 sm:static sm:z-auto sm:bg-transparent
          ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          } sm:opacity-100 sm:pointer-events-auto
        `}
        onClick={() => setSidebarOpen(false)}
      >
        <aside
          className={`
            w-64 bg-[#141516] border-r border-[#3a3b3e] h-full transition-transform duration-200
            fixed left-0 top-0 z-50 sm:static sm:translate-x-0
            ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } sm:translate-x-0
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button on mobile */}
          <button
            className="sm:hidden absolute top-4 right-4 bg-[#23232a] p-2 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <img
              src={closeSidebarIcon}
              alt="Close Sidebar"
              className="w-6 h-6"
            />
          </button>
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  props.onChangeTab(tab.key);
                  setSidebarOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                  props.activeTab === tab.key
                    ? "bg-[#1e1f22] text-white shadow-inner"
                    : "text-gray-400 hover:bg-[#3a3b3e] hover:text-white"
                }
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
};

export default ChannelSidebar;
