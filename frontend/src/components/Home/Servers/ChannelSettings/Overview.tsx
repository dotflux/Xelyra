import { useState, useEffect } from "react";

interface Props {
  channelId: string;
  channelName: string;
}

const Overview = (props: Props) => {
  // Local state for the form
  const [name, setName] = useState(props.channelName);
  const [slowMode, setSlowMode] = useState("0");
  const [ageRestricted, setAgeRestricted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(
      name !== props.channelName || slowMode !== "0" || ageRestricted !== false
    );
  }, [name, slowMode, ageRestricted, props.channelName]);

  const handleSave = async () => {};

  return (
    <div className="space-y-12">
      {/* Rename Section */}
      <section className=" p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Channel Name</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 bg-[#1e1f22] border border-[#3a3b3e] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
        <p className="mt-2 text-sm text-gray-400">
          Change your channel's name. This will update how it appears to all
          members.
        </p>
      </section>

      {/* Slow Mode Section */}
      <section className="  p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Slow Mode</h3>
        <p className="text-sm text-gray-400 mb-2">
          Prevent users from sending messages too quickly.
        </p>
        <select
          value={slowMode}
          onChange={(e) => setSlowMode(e.target.value)}
          className="w-full p-3 bg-[#1e1f22] border border-[#3a3b3e] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        >
          <option value="0">Off</option>
          <option value="5">5 seconds</option>
          <option value="10">10 seconds</option>
          <option value="30">30 seconds</option>
          <option value="60">1 minute</option>
        </select>
      </section>

      {/* Age Restriction Section */}
      <section className=" p-6 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Age Restriction</h3>
          <p className="text-sm text-gray-400">
            Only users over 18 can view this channel.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={ageRestricted}
            onChange={(e) => setAgeRestricted(e.target.checked)}
            className="sr-only"
          />
          <div className="w-11 h-6 bg-gray-600 rounded-full peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 transition-colors" />
          <span className="ml-3 text-sm font-medium text-white">
            {ageRestricted ? "Enabled" : "Disabled"}
          </span>
        </label>
      </section>

      {/* Save Button */}
      {isDirty && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#2a2b2e] border border-[#3a3b3e] text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 max-w-xl w-[95%]">
          <span className="flex-1 text-sm font-medium text-gray-200">
            Unsaved changes were detected
          </span>

          <button
            onClick={() => {
              setName(props.channelName);
              setSlowMode("0");
              setAgeRestricted(false);
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
      )}
    </div>
  );
};

export default Overview;
