import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "./UserContext";
import Profile from "./UserSettings/Profile";
import Account from "./UserSettings/Account";

const TABS = ["Account", "Profile", "Developer"];

function UserSettings({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [tab, setTab] = useState("Account");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

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
    if (t === "Developer") {
      navigate("/developer");
      onClose();
      return;
    }
    setTab(t);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/home/logout",
        {},
        { withCredentials: true }
      );

      if (response.data.valid) {
        onClose();
        navigate("/login");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    } finally {
      setLogoutLoading(false);
      setLogoutModalOpen(false);
    }
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
        <div className="p-4 border-t border-[#3a3b3e] space-y-2">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-[#3a3b3e] rounded-lg transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
          >
            Logout
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

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80">
          <div className="bg-[#2f3136] rounded-lg p-6 w-96 max-w-sm mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Logout</h3>
              <p className="text-gray-400 text-sm">
                Are you sure you want to logout? You will be signed out of your
                account.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 px-4 py-2 bg-[#3a3b3e] hover:bg-[#4a4b4e] text-white rounded-lg font-medium transition-colors"
                disabled={logoutLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={logoutLoading}
              >
                {logoutLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSettings;
