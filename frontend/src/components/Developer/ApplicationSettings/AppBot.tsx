import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AppBotCreate from "./AppBotCreate";
import VerifyTokenModal from "./VerifyTokenModal";

interface BotInfo {
  bot_id: string;
}

const AppBot = () => {
  const { id } = useParams();
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [token, setToken] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isViewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    const onMount = async () => {
      if (!id) return;
      try {
        const res = await axios.post(
          `http://localhost:3000/developer/applications/${id}/fetch/bot`,
          {},
          { withCredentials: true }
        );
        if (res.data.valid) {
          setBotInfo(res.data.botInfo);
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

  if (!botInfo) return <AppBotCreate setBotInfo={setBotInfo} />;

  return (
    <div>
      <h1 className="text-white font-bold text-2xl mb-4">Bot</h1>
      <p className="text-gray-400 text-xl font-medium mb-4">
        Customise your bot's settings, get your token and more.
      </p>
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1 space-y-6">
          <div>
            <h4 className="font-bold text-white text-sm mb-2">Bot User ID</h4>
            <p className="text-gray-400 text-sm mb-2">{botInfo.bot_id}</p>
            <button className="text-white rounded bg-blue-700 shadow-sm transition-all px-4 py-1">
              Copy
            </button>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Token</h4>
            {token ? (
              <div>
                <p className="text-gray-400 text-sm mb-2">{token}</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 text-sm mb-2">
                  Verify your presence by password to view the token
                </p>
                <button
                  className="text-white items-end justify-end ml-auto rounded bg-blue-700 shadow-sm transition-all px-4 py-1"
                  onClick={() => setViewOpen(true)}
                >
                  View
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Public Bot</h4>
              <p className="text-gray-400 text-sm">
                Do you want to keep your bot available to public?
              </p>
            </div>

            {/* Toggle switch */}
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                isPublic ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  isPublic ? "translate-x-7" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>
      {isDirty && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#2a2b2e] border border-[#3a3b3e] text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 max-w-xl w-[95%]">
          <span className="flex-1 text-sm font-medium text-gray-200">
            Unsaved changes were detected
          </span>

          <button
            onClick={() => {}}
            className="text-sm text-gray-300 hover:underline"
          >
            Reset
          </button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Save Changes
          </button>
        </div>
      )}
      {isViewOpen && (
        <VerifyTokenModal
          setToken={setToken}
          isOpen={isViewOpen}
          onClose={() => setViewOpen(false)}
        />
      )}
    </div>
  );
};

export default AppBot;
