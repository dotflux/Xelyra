import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import arrowRightIcon from "../../assets/arrowRight.svg";

type AppKey = "overview" | "bot" | "add";

const appTabs: { key: AppKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "bot", label: "Bot" },
  { key: "add", label: "Add Application" },
];

const ApplicationsSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1e1f22]/80 backdrop-blur-sm rounded-lg border border-[#3a3b3e]/50"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div
            className={`w-5 h-0.5 bg-white transition-all ${
              isOpen ? "rotate-45 translate-y-1" : ""
            }`}
          ></div>
          <div
            className={`w-5 h-0.5 bg-white my-1 transition-all ${
              isOpen ? "opacity-0" : ""
            }`}
          ></div>
          <div
            className={`w-5 h-0.5 bg-white transition-all ${
              isOpen ? "-rotate-45 -translate-y-1" : ""
            }`}
          ></div>
        </div>
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#141516] border-r border-[#3a3b3e] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="p-4 space-y-2">
          <button
            className={`block text-gray-400 w-full text-left px-4 py-2 rounded-lg font-medium transition hover:bg-[#3a3b3e] hover:text-white`}
            onClick={() => {
              navigate(`/developer/development/applications`);
              closeSidebar();
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
                navigate(
                  `/developer/development/applications/${id}/${tab.key}`
                );
                closeSidebar();
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
    </>
  );
};

export default ApplicationsSidebar;
