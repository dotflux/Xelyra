import { useState, useEffect } from "react";
import axios from "axios";
import closeSidebarIcon from "../../../../assets/closeSidebar.svg";
import plusIcon from "../../../../assets/plus.svg";
import gearIcon from "../../../../assets/cog.svg";
import kickIcon from "../../../../assets/userRemove.svg";
import GroupAdd from "./GroupAdd";
import GroupSettingsModal from "./GroupSettingsModal";

interface Props {
  showPanel: boolean;
  onClose: () => void;
  channel: string | null;
}

interface Participant {
  username: string;
  id: string;
}

const GroupPanel = (props: Props) => {
  if (!props.showPanel) return;
  const [partInfo, setPartInfo] = useState<Participant[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const onMount = async () => {
    try {
      if (!props.showPanel) return;
      const response = await axios.post(
        "http://localhost:3000/home/groups/participants",
        { group: props.channel },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setPartInfo(response.data.partData);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  useEffect(() => {
    onMount();
  }, [props.channel]);

  const onKick = async (participant: string) => {
    try {
      if (!props.showPanel || !participant) return;
      await axios.post(
        "http://localhost:3000/home/groups/kick",
        { group: props.channel, participant },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-64 bg-[#191a1d] shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2b2e]">
        <button
          onClick={props.onClose}
          className="p-1 hover:bg-[#2a2b2e] rounded"
        >
          <img src={closeSidebarIcon} alt="Close" className="h-5 w-5" />
        </button>
        <div className="flex space-x-2">
          <button
            className="p-1 hover:bg-[#2a2b2e] rounded"
            onClick={() => {
              setShowAdd(true);
            }}
          >
            <img src={plusIcon} alt="Add" className="h-5 w-5" />
          </button>
          <button
            className="p-1 hover:bg-[#2a2b2e] rounded"
            onClick={() => setShowSettings(true)}
          >
            <img src={gearIcon} alt="Settings" className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {partInfo &&
          partInfo.map((p) => (
            <div
              key={p.id}
              className="group flex items-center justify-between p-2 rounded hover:bg-[#2a2b2e] transition"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md mr-3">
                  {p.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white">{p.username}</span>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3a3b3e] rounded transition"
                onClick={() => {
                  onKick(p.id);
                }}
              >
                <img src={kickIcon} alt="Kick" className="h-4 w-4" />
              </button>
            </div>
          ))}
      </div>
      {showAdd && (
        <GroupAdd
          isOpen={showAdd}
          onClose={() => {
            setShowAdd(false);
          }}
        />
      )}
      {showSettings && (
        <GroupSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          groupId={props.channel}
        />
      )}
    </div>
  );
};

export default GroupPanel;
