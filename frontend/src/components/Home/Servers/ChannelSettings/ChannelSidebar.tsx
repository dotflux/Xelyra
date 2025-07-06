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

const ChannelSidebar = (props: Props) => {
  return (
    <aside className="w-64 bg-[#141516] border-r border-[#3a3b3e]">
      <nav className="p-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => props.onChangeTab(tab.key)}
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
  );
};

export default ChannelSidebar;
