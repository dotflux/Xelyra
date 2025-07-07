import { useNavigate, useLocation, useParams } from "react-router-dom";
import arrowRightIcon from "../../assets/arrowRight.svg";

type AppKey = "overview" | "bot";

const appTabs: { key: AppKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "bot", label: "Bot" },
];

const ApplicationsSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  return (
    <aside className="w-64 h-screen bg-[#141516] border-r border-[#3a3b3e]">
      <nav className="p-4 space-y-2">
        <button
          className={`block text-gray-400 w-full text-left px-4 py-2 rounded-lg font-medium transition hover:bg-[#3a3b3e] hover:text-white`}
          onClick={() => {
            navigate(`/developer/development/applications`);
          }}
        >
          <div className="flex gap-2">
            <img src={arrowRightIcon} /> Back To Applications
          </div>
        </button>
        {appTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              navigate(`/developer/development/applications/${id}/${tab.key}`);
            }}
            className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition ${
              location.pathname.startsWith(
                `/developer/development/applications/${id}/${tab.key}`
              )
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

export default ApplicationsSidebar;
