import React, { useState, useRef } from "react";
import axios from "axios";

interface ProfileProps {
  userInfo: any;
  onUpdate: (updates: any) => void;
}

// Utility to check if a color is light
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
  // Perceived brightness
  return r * 0.299 + g * 0.587 + b * 0.114 > 186;
}

const Profile: React.FC<ProfileProps> = ({ userInfo, onUpdate }) => {
  if (!userInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400">
        Loading user info...
      </div>
    );
  }
  const [userEdit, setUserEdit] = useState({
    displayName: userInfo?.displayName || "",
    bio: userInfo?.bio || "",
    pfp: userInfo?.pfp || "",
    banner: userInfo?.banner || null,
    primary_theme: userInfo?.primary_theme || "#5865F2",
    secondary_theme: userInfo?.secondary_theme || "#23232a",
  });
  const [savingUser, setSavingUser] = useState(false);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    userInfo?.banner || null
  );

  const userChanged =
    userEdit.displayName !== (userInfo?.displayName || "") ||
    userEdit.bio !== (userInfo?.bio || "") ||
    userEdit.pfp !== (userInfo?.pfp || "") ||
    userEdit.banner !== (userInfo?.banner || null) ||
    userEdit.primary_theme !== (userInfo?.primary_theme || "#5865F2") ||
    userEdit.secondary_theme !== (userInfo?.secondary_theme || "#23232a");

  const handleUserField = (field: string, value: any) => {
    setUserEdit((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const url = URL.createObjectURL(file);
    setBannerPreview(url);
    setUserEdit((prev) => ({ ...prev, banner: url }));
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setUserEdit((prev) => ({ ...prev, banner: null }));
  };

  const handleColorChange = (
    field: "primary_theme" | "secondary_theme",
    value: string
  ) => {
    setUserEdit((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async () => {
    setSavingUser(true);
    setError(null);
    setSuccess(null);
    try {
      if (userEdit.displayName !== (userInfo?.displayName || "")) {
        await axios.post(
          "http://localhost:3000/home/user/changeDisplayName",
          { displayName: userEdit.displayName },
          { withCredentials: true }
        );
      }
      if (userEdit.bio !== (userInfo?.bio || "")) {
        await axios.post(
          "http://localhost:3000/home/user/changeBio",
          { bio: userEdit.bio },
          { withCredentials: true }
        );
      }
      if (
        userEdit.banner !== (userInfo?.banner || null) ||
        userEdit.primary_theme !== (userInfo?.primary_theme || "#5865F2") ||
        userEdit.secondary_theme !== (userInfo?.secondary_theme || "#23232a")
      ) {
        const formData = new FormData();
        if (bannerFile) formData.append("banner", bannerFile);
        if (!bannerFile && !bannerPreview && userInfo?.banner)
          formData.append("removeBanner", "true");
        formData.append("primary_theme", userEdit.primary_theme);
        formData.append("secondary_theme", userEdit.secondary_theme);
        const res = await axios.post(
          "http://localhost:3000/home/user/changeBannerTheme",
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setUserEdit((prev) => ({
          ...prev,
          banner: res.data.banner,
          primary_theme: res.data.primary_theme,
          secondary_theme: res.data.secondary_theme,
        }));
        onUpdate({
          banner: res.data.banner,
          primary_theme: res.data.primary_theme,
          secondary_theme: res.data.secondary_theme,
        });
      }
      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
      } else {
        setError("Network Error");
      }
      console.log("Profile update error:", error);
    } finally {
      setSavingUser(false);
    }
  };

  const handleResetUser = () => {
    setUserEdit({
      displayName: userInfo?.displayName || "",
      bio: userInfo?.bio || "",
      pfp: userInfo?.pfp || "",
      banner: userInfo?.banner || null,
      primary_theme: userInfo?.primary_theme || "#5865F2",
      secondary_theme: userInfo?.secondary_theme || "#23232a",
    });
    setBannerFile(null);
    setBannerPreview(userInfo?.banner || null);
    setError(null);
    setSuccess(null);
  };

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPfp(true);
    const formData = new FormData();
    formData.append("pfp", file);
    try {
      const res = await axios.post("http://localhost:3000/home/pfp", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.pfp) {
        setUserEdit((prev) => ({ ...prev, pfp: res.data.pfp }));
        onUpdate({ pfp: res.data.pfp });
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
      } else {
        setError("Network Error");
      }
      console.log("Avatar upload error:", error);
    }
    setUploadingPfp(false);
  };

  const handleRemoveAvatar = async () => {
    setUploadingPfp(true);
    try {
      await axios.post(
        "http://localhost:3000/home/pfp",
        { remove: true },
        { withCredentials: true }
      );
      setUserEdit((prev) => ({ ...prev, pfp: "" }));
      onUpdate({ pfp: "" });
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
      } else {
        setError("Network Error");
      }
      console.log("Avatar remove error:", error);
    }
    setUploadingPfp(false);
  };

  const previewPfp = userEdit.pfp
    ? userEdit.pfp.startsWith("/uploads/")
      ? `http://localhost:3000${userEdit.pfp}`
      : userEdit.pfp
    : null;

  const previewBanner = bannerPreview
    ? bannerPreview.startsWith("/uploads/")
      ? `http://localhost:3000${bannerPreview}`
      : bannerPreview
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
      <div className="flex-1 space-y-8">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-2">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-2">
            {success}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-white mb-1">
            Banner
          </label>
          <div
            className="relative h-24 rounded-xl overflow-hidden border border-[#3a3b3e] mb-2 flex items-center justify-center bg-gradient-to-r"
            style={{
              background: !previewBanner
                ? `linear-gradient(90deg, ${userEdit.primary_theme}, ${userEdit.secondary_theme})`
                : undefined,
            }}
          >
            {previewBanner ? (
              <img
                src={previewBanner}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : null}
            {!previewBanner && (
              <span className="text-xs text-gray-400">No banner set</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
            >
              Change Banner
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-[#23232a] hover:bg-[#3a3b3e] text-gray-200 rounded-lg font-semibold transition-colors"
              onClick={handleRemoveBanner}
              disabled={uploadingBanner || !previewBanner}
            >
              Remove Banner
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={bannerInputRef}
              onChange={handleBannerChange}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-semibold text-white mb-1">
              Primary Color
            </label>
            <input
              type="color"
              value={userEdit.primary_theme}
              onChange={(e) =>
                handleColorChange("primary_theme", e.target.value)
              }
              className="w-10 h-10 rounded border-2 border-[#3a3b3e] bg-transparent cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white mb-1">
              Secondary Color
            </label>
            <input
              type="color"
              value={userEdit.secondary_theme}
              onChange={(e) =>
                handleColorChange("secondary_theme", e.target.value)
              }
              className="w-10 h-10 rounded border-2 border-[#3a3b3e] bg-transparent cursor-pointer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-1">
            Display Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg bg-[#23232a] border border-[#3a3b3e] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium transition-colors"
            value={userEdit.displayName}
            onChange={(e) => handleUserField("displayName", e.target.value)}
            placeholder="Enter display name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-1">
            Bio
          </label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-[#23232a] border border-[#3a3b3e] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
            value={userEdit.bio}
            onChange={(e) => handleUserField("bio", e.target.value)}
            placeholder="Tell us about yourself..."
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="w-16 h-16 rounded-full bg-[#2a2b2e] flex items-center justify-center border-2 border-[#3a3b3e] shadow-lg overflow-hidden">
            {uploadingPfp ? (
              <span className="text-indigo-400 animate-pulse text-sm">
                Uploading...
              </span>
            ) : previewPfp ? (
              <img
                src={previewPfp}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-gray-500 font-bold">
                {userEdit.displayName?.[0]?.toUpperCase() ||
                  userInfo?.username?.[0]?.toUpperCase() ||
                  "?"}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPfp}
            >
              Change Avatar
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-[#23232a] hover:bg-[#3a3b3e] text-gray-200 rounded-lg font-semibold transition-colors"
              onClick={handleRemoveAvatar}
              disabled={uploadingPfp || !userEdit.pfp}
            >
              Remove Avatar
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleIconChange}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveUser}
            disabled={!userChanged || savingUser}
          >
            {savingUser ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-[#23232a] hover:bg-[#3a3b3e] text-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleResetUser}
            disabled={savingUser}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="w-full md:w-[350px] flex-shrink-0">
        <div
          className="rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br"
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${userEdit.primary_theme}, ${userEdit.secondary_theme})`,
            border: `2px solid ${userEdit.secondary_theme}`,
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="h-24 w-full">
              {previewBanner ? (
                <img
                  src={previewBanner}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex flex-col items-center -mt-10 pb-6">
              <div className="w-20 h-20 rounded-full border-4 border-[#23232a] bg-[#1e1f22] overflow-hidden flex items-center justify-center">
                {previewPfp ? (
                  <img
                    src={previewPfp}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-gray-500 font-bold">
                    {userEdit.displayName?.[0]?.toUpperCase() ||
                      userInfo?.username?.[0]?.toUpperCase() ||
                      "?"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xl font-bold ${
                    isColorLight(userEdit.primary_theme) &&
                    isColorLight(userEdit.secondary_theme)
                      ? "text-gray-900"
                      : "text-white"
                  }`}
                >
                  {userEdit.displayName || userInfo?.username}
                </span>
                <span className="text-green-400 text-lg">●</span>
              </div>
              <div
                className={`${
                  isColorLight(userEdit.primary_theme) &&
                  isColorLight(userEdit.secondary_theme)
                    ? "text-gray-700"
                    : "text-gray-400"
                } text-sm`}
              >
                @{userInfo?.username}
              </div>
              <div
                className={`text-xs mt-2 text-center max-w-[90%] ${
                  isColorLight(userEdit.primary_theme) &&
                  isColorLight(userEdit.secondary_theme)
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {userEdit.bio || (
                  <span className="italic text-gray-600">No bio set.</span>
                )}
              </div>
              <button className="mt-4 px-4 py-2 bg-[#23232a] text-gray-300 rounded-lg font-semibold cursor-default">
                Example Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
