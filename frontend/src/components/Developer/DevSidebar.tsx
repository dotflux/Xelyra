import { useNavigate, useLocation } from "react-router-dom";

type TabKey = "applications" | "documentation";

const tabs: { key: TabKey; label: string }[] = [
  { key: "applications", label: "Applications" },
  { key: "documentation", label: "Documentation" },
];

const DevSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <aside className="w-64 h-screen bg-[#141516] border-r border-[#3a3b3e]">
      <nav className="p-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              navigate(`/developer/development/${tab.key}`);
            }}
            className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition ${
              location.pathname.startsWith(`/developer/${tab.key}`)
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

export default DevSidebar;
