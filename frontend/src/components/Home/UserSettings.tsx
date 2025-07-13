import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import Profile from "./UserSettings/Profile";
import Account from "./UserSettings/Account";

const TABS = ["Account", "Profile"];

function UserSettings({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, setUser } = useUser();
  const [tab, setTab] = useState("Account");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setUserInfo(user);
  }, [isOpen, user]);

  const handleUserUpdate = (updates: any) => {
    setUserInfo((prev: any) => ({ ...prev, ...updates }));
    setUser((prev: any) => ({ ...prev, ...updates }));
  };

  const handleProfileTab = () => {
    setTab("Profile");
    setSidebarOpen(false);
  };

  const handleTabSelect = (t: string) => {
    setTab(t);
    setSidebarOpen(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex bg-black/80">
      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden absolute top-4 left-4 z-50 bg-[#23232a] p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar (overlay on mobile, static on desktop) */}
      <div
        className={`fixed md:static top-0 left-0 h-full z-40 transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:flex w-64 bg-[#141516] border-r border-[#3a3b3e] flex-col`}
        style={{ minWidth: "16rem" }}
      >
        <div className="p-6 border-b border-[#3a3b3e]">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-[#23232a] flex items-center justify-center mb-3 border-2 border-[#3a3b3e] shadow-lg overflow-hidden">
              {userInfo?.pfp ? (
                <img
                  src={
                    userInfo.pfp.startsWith("/uploads/")
                      ? `http://localhost:3000${userInfo.pfp}`
                      : userInfo.pfp
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-500 font-bold">
                  {userInfo?.displayName?.[0]?.toUpperCase() ||
                    userInfo?.username?.[0]?.toUpperCase() ||
                    "?"}
                </span>
              )}
            </div>
            <div className="text-base font-bold text-white mb-1 truncate w-full text-center">
              {userInfo?.displayName || userInfo?.username || "User"}
            </div>
            <div className="text-xs text-gray-400 text-center w-full truncate">
              User Settings
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => handleTabSelect(t)}
              className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                tab === t
                  ? "bg-[#1e1f22] text-white shadow-inner"
                  : "text-gray-400 hover:bg-[#3a3b3e] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#3a3b3e]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-[#3a3b3e] rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
        {/* Close button for mobile sidebar */}
        <button
          className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
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
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "Profile" && (
            <Profile userInfo={userInfo} onUpdate={handleUserUpdate} />
          )}
          {tab === "Account" && (
            <Account
              userInfo={userInfo}
              onUpdate={handleUserUpdate}
              onProfileTab={handleProfileTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
