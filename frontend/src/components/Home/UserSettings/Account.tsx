import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import axios from "axios";

interface AccountProps {
  userInfo: any;
  onUpdate: (updates: any) => void;
  onProfileTab: () => void;
}

interface UsernameForm {
  newUsername: string;
  password: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function isColorLight(hex: string) {
  if (!hex) return false;
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 186;
}

const Account: React.FC<AccountProps> = ({
  userInfo,
  onUpdate,
  onProfileTab,
}) => {
  if (!userInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400">
        Loading user info...
      </div>
    );
  }
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Username form
  const {
    register: registerUsername,
    handleSubmit: handleUsernameSubmit,
    reset: resetUsernameForm,
    formState: { errors: usernameErrors, isSubmitting: isUsernameSubmitting },
  } = useForm<UsernameForm>();

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordForm>();

  const onUsernameSubmit: SubmitHandler<UsernameForm> = async (data) => {
    setUsernameError("");
    setUsernameLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/home/user/changeUsername",
        { newUsername: data.newUsername, password: data.password },
        { withCredentials: true }
      );
      onUpdate({ username: data.newUsername });
      setShowUsernameModal(false);
      resetUsernameForm();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setUsernameError(error.response.data.message);
      } else {
        setUsernameError("Network Error");
        console.log("Network Error:", error);
      }
    }
    setUsernameLoading(false);
  };

  const onPasswordSubmit: SubmitHandler<PasswordForm> = async (data) => {
    setPasswordError("");
    setPasswordLoading(true);
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordLoading(false);
      return;
    }
    try {
      await axios.post("http://localhost:3000/home/user/changePassword", data, {
        withCredentials: true,
      });
      setShowPasswordModal(false);
      resetPasswordForm();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setPasswordError(error.response.data.message);
      } else {
        setPasswordError("Network Error");
        console.log("Network Error:", error);
      }
    }
    setPasswordLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Unified Profile + Info Card */}
      <div
        className="rounded-xl border border-[#3a3b3e] relative overflow-hidden shadow-2xl"
        style={{
          background:
            userInfo?.primary_theme && userInfo?.secondary_theme
              ? `linear-gradient(135deg, ${userInfo.primary_theme}, ${userInfo.secondary_theme})`
              : "#1e1f22",
        }}
      >
        {/* Dynamic text color based on theme brightness */}
        <style>
          {`
             .theme-text {
               color: ${
                 userInfo?.primary_theme
                   ? isColorLight(userInfo.primary_theme)
                     ? "#000000"
                     : "#ffffff"
                   : "#ffffff"
               } !important;
             }
             .theme-text-secondary {
               color: ${
                 userInfo?.primary_theme
                   ? isColorLight(userInfo.primary_theme)
                     ? "#374151"
                     : "#9ca3af"
                   : "#9ca3af"
               } !important;
             }
           `}
        </style>
        {/* Banner section */}
        <div className="w-full h-24 relative rounded-t-xl overflow-hidden bg-[#2a2b2e]">
          {userInfo.banner ? (
            <img
              src={
                userInfo.banner.startsWith("/uploads/")
                  ? `http://localhost:3000${userInfo.banner}`
                  : userInfo.banner
              }
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full bg-gradient-to-r"
              style={{
                background: `linear-gradient(90deg, ${
                  userInfo?.primary_theme || "#5865F2"
                }, ${userInfo?.secondary_theme || "#23232a"})`,
              }}
            />
          )}
        </div>
        {/* Card content row: avatar + text */}
        <div className="relative px-4 pb-4">
          <div className="flex items-end">
            <div className="relative -mt-12">
              <div className="w-20 h-20 rounded-full border-4 border-[#1e1f22] bg-[#2a2b2e] overflow-hidden flex items-center justify-center shadow-lg">
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
            </div>
          </div>
          {/* User Info Section */}
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold theme-text truncate">
                {userInfo?.displayName || userInfo?.username}
              </h3>
            </div>
            <p className="text-sm theme-text-secondary mb-3">
              @{userInfo?.username}
            </p>

            {/* Info section */}
            <div className="space-y-4">
              {/* Display Name */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold theme-text">Display Name</div>
                  <div className="theme-text-secondary">
                    {userInfo?.displayName || "-"}
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-[#23232a] hover:bg-[#3a3b3e] text-gray-200 rounded-lg font-semibold transition-colors"
                  onClick={onProfileTab}
                >
                  Edit
                </button>
              </div>
              {/* Username */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold theme-text">Username</div>
                  <div className="theme-text-secondary">
                    {userInfo?.username}
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-[#23232a] hover:bg-[#3a3b3e] text-gray-200 rounded-lg font-semibold transition-colors"
                  onClick={() => setShowUsernameModal(true)}
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Edit User Profile Button */}
            <div className="border-t border-[#3a3b3e] pt-3 mt-4">
              <button
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                onClick={onProfileTab}
              >
                Edit User Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password and Authentication */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Password and Authentication
        </h3>
        <button
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>
      </div>

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#202127] rounded-2xl shadow-xl border border-[#3a3b3e] p-8 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowUsernameModal(false);
                resetUsernameForm();
                setUsernameError("");
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
            <h4 className="text-lg font-bold text-white mb-4">
              Change Username
            </h4>
            <form
              className="space-y-4"
              onSubmit={handleUsernameSubmit(onUsernameSubmit)}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  New Username
                </label>
                <input
                  type="text"
                  {...registerUsername("newUsername", {
                    required: "Username is required",
                    minLength: { value: 3, message: "Min 3 characters" },
                    maxLength: { value: 20, message: "Max 20 characters" },
                  })}
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new username"
                />
                {usernameErrors.newUsername && (
                  <div className="text-red-400 text-xs mt-1">
                    {usernameErrors.newUsername.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...registerUsername("password", {
                    required: "Password is required",
                  })}
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                />
                {usernameErrors.password && (
                  <div className="text-red-400 text-xs mt-1">
                    {usernameErrors.password.message}
                  </div>
                )}
              </div>
              {usernameError && (
                <div className="text-red-400 text-xs mb-2">{usernameError}</div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
                  disabled={isUsernameSubmitting || usernameLoading}
                >
                  {isUsernameSubmitting || usernameLoading
                    ? "Saving..."
                    : "Save"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded font-semibold transition-colors"
                  onClick={() => {
                    setShowUsernameModal(false);
                    resetUsernameForm();
                    setUsernameError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#202127] rounded-2xl shadow-xl border border-[#3a3b3e] p-8 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                resetPasswordForm();
                setPasswordError("");
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
            <h4 className="text-lg font-bold text-white mb-4">
              Change Password
            </h4>
            <form
              className="space-y-4"
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  {...registerPassword("currentPassword", {
                    required: "Current password is required",
                  })}
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter current password"
                />
                {passwordErrors.currentPassword && (
                  <div className="text-red-400 text-xs mt-1">
                    {passwordErrors.currentPassword.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: { value: 8, message: "Min 8 characters" },
                    maxLength: { value: 32, message: "Max 32 characters" },
                  })}
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password"
                />
                {passwordErrors.newPassword && (
                  <div className="text-red-400 text-xs mt-1">
                    {passwordErrors.newPassword.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Re-type New Password
                </label>
                <input
                  type="password"
                  {...registerPassword("confirmPassword", {
                    required: "Please re-type new password",
                  })}
                  className="w-full px-3 py-2 rounded bg-[#18191c] border border-[#23232a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Re-type new password"
                />
                {passwordErrors.confirmPassword && (
                  <div className="text-red-400 text-xs mt-1">
                    {passwordErrors.confirmPassword.message}
                  </div>
                )}
              </div>
              {passwordError && (
                <div className="text-red-400 text-xs mb-2">{passwordError}</div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
                  disabled={isPasswordSubmitting || passwordLoading}
                >
                  {isPasswordSubmitting || passwordLoading
                    ? "Saving..."
                    : "Save"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-gray-200 rounded font-semibold transition-colors"
                  onClick={() => {
                    setShowPasswordModal(false);
                    resetPasswordForm();
                    setPasswordError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
