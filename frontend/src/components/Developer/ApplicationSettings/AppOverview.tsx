import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import chartIcon from "../../../assets/chartMixed.svg";

interface AppInfo {
  app_name: string;
  description: string;
  count: number;
  app_id: string;
  pfp?: string;
}

const AppOverview = () => {
  const { id } = useParams();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isDirty, setIsDirty] = useState(false);
  const [pfpUploading, setPfpUploading] = useState(false);

  useEffect(() => {
    const onMount = async () => {
      if (!id) return;
      try {
        const res = await axios.post(
          `http://localhost:3000/developer/applications/${id}/fetch/overview`,
          {},
          { withCredentials: true }
        );
        if (res.data.valid) {
          setAppInfo(res.data.appInfo);
          setName(res.data.appInfo.app_name);
          setDescription(res.data.appInfo.description);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.log(error.response.data.message);
        } else {
          console.log("Network Error:", error);
        }
      }
    };
    onMount();
  }, []);

  useEffect(() => {
    if (!appInfo) return;
    setIsDirty(
      name !== appInfo.app_name || appInfo.description !== description
    );
  }, [name, description, appInfo]);

  const handleSave = async () => {
    if (!appInfo) return;
    if (!id) return;
    if (appInfo.app_name === name && appInfo.description === description)
      return;

    try {
      const res = await axios.post(
        `http://localhost:3000/developer/applications/${id}/update/overview`,
        { name, description },
        { withCredentials: true }
      );

      if (res.data.valid) {
        setAppInfo(res.data.newInfo);
        setName(res.data.newInfo.app_name);
        setDescription(res.data.newInfo.description);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  const handlePfpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !id) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    setPfpUploading(true);
    try {
      const res = await axios.post(
        `http://localhost:3000/developer/applications/${id}/update/pfp`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.data.valid && res.data.pfp) {
        setAppInfo((prev) => (prev ? { ...prev, pfp: res.data.pfp } : prev));
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    } finally {
      setPfpUploading(false);
    }
  };

  if (!appInfo) return null;

  return (
    <div className="px-4 lg:px-0">
      <h1 className="text-white font-bold text-2xl mb-4">Overview</h1>
      <p className="text-gray-400 text-xl font-medium mb-4">
        Customise your app's information such as name,description and more.
      </p>
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
        {/* Left side: Name & Description */}
        <div className="flex-1 space-y-6 w-full">
          <div className="flex flex-col">
            <label className="text-white font-medium mb-1">Name</label>
            <input
              type="text"
              placeholder="Enter app name"
              value={name}
              maxLength={20}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className="w-full px-3 py-2 bg-[#0e0f0f] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-white font-medium mb-1">Description</label>
            <textarea
              placeholder="Enter app description"
              value={description || ""}
              maxLength={120}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              className="w-full h-24 px-3 py-2 bg-[#0e0f0f] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-2">
              Application ID
            </h4>
            <p className="text-gray-400 text-sm mb-2 break-all">
              {appInfo.app_id}
            </p>
            <button
              className="text-white rounded bg-blue-700 shadow-sm transition-all px-4 py-1"
              onClick={() => navigator.clipboard.writeText(appInfo.app_id)}
            >
              Copy
            </button>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-2">Install Count</h4>
            <p className="text-gray-400 text-sm mb-2">
              This is the approximate number of servers using your application
            </p>
            <div className="flex items-center gap-x-2">
              <img src={chartIcon} />
              <span className="text-gray-400"> {appInfo.count} Servers</span>
            </div>
          </div>
        </div>

        {/* Right side: Avatar box */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-full lg:w-auto">
          <div className="h-32 w-32 bg-[#0d0d0e] rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden">
            {appInfo.pfp ? (
              <img
                src={
                  appInfo.pfp.startsWith("/uploads/")
                    ? `http://localhost:3000${appInfo.pfp}`
                    : appInfo.pfp
                }
                alt="App PFP"
                className="h-32 w-32 object-cover rounded-2xl"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl font-semibold text-white">
                {appInfo.app_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <label
            className="mt-2 flex flex-col items-center gap-1 w-full"
            htmlFor="app-pfp-input"
          >
            <span className="text-xs text-gray-300 font-medium">
              Change App Icon
            </span>
            <input
              id="app-pfp-input"
              type="file"
              accept="image/*"
              className="block text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 w-full"
              onChange={handlePfpChange}
              disabled={pfpUploading}
            />
          </label>
          {pfpUploading && (
            <span className="text-xs text-gray-400 mt-1">Uploading...</span>
          )}
        </div>
      </div>
      {isDirty && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#2a2b2e] border border-[#3a3b3e] text-white px-6 py-4 rounded-lg shadow-lg flex flex-col sm:flex-row items-center gap-4 max-w-xl w-[95%]">
          <span className="flex-1 text-sm font-medium text-gray-200 text-center sm:text-left">
            Unsaved changes were detected
          </span>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setName(appInfo.app_name);
                setDescription(appInfo.description);
              }}
              className="text-sm text-gray-300 hover:underline"
            >
              Reset
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppOverview;
