import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import errorIcon from "../../../../assets/error.svg";
import axios from "axios";

interface Friend {
  username: string;
  id: string;
  pfp?: string;
  displayName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GroupAdd = (props: Props) => {
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const channel = searchParams.get("channel");

  const onMount = async () => {
    try {
      if (!props.isOpen) return;
      const response = await axios.post(
        "http://localhost:3000/home/friends",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setFriends(response.data.friendData);
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
  }, []);

  const toggleParticipant = (id: string) => {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSubmit = async () => {
    try {
      if (!props.isOpen) return;
      if (participants.length < 1) {
        setError("Pick at least 1 friend");
        return;
      }
      if (!channel) return;
      setError("");
      setSubmitting(true);
      const response = await axios.post(
        "http://localhost:3000/home/groups/add",
        { group: channel, participants },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        props.onClose();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
        setError(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!props.isOpen) return;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#2a2b2e] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-[#3a3b3e]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add To Group</h2>
          <button
            onClick={props.onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200"
            aria-label="Close modal"
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
        </div>

        <div className="space-y-4">
          {/* Selected Participants */}
          {participants.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Selected ({participants.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {participants.map((id) => {
                  const friend = friends && friends.find((f) => f.id === id);
                  const displayName =
                    friend?.displayName || friend?.username || id;
                  return (
                    <span
                      key={id}
                      className="flex items-center bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg"
                    >
                      {friend?.pfp ? (
                        <img
                          src={
                            friend.pfp.startsWith("/uploads/")
                              ? `http://localhost:3000${friend.pfp}`
                              : friend.pfp
                          }
                          alt={displayName}
                          className="h-6 w-6 rounded-full object-cover border border-gray-700 shadow mr-2"
                        />
                      ) : (
                        <span className="h-6 w-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-white shadow mr-2">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      {displayName}
                      <button
                        onClick={() => toggleParticipant(id)}
                        className="ml-2 hover:text-gray-200 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4"
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
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Friend List */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Friends
            </label>
            <div className="max-h-48 overflow-y-auto border border-[#3a3b3e] rounded-lg p-3 bg-[#191a1d] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {friends &&
                friends.map((f) => {
                  const displayName = f.displayName || f.username;
                  return (
                    <div
                      key={f.id}
                      onClick={() => toggleParticipant(f.id)}
                      className={`cursor-pointer px-4 py-3 mb-2 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                        participants.includes(f.id)
                          ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
                          : "bg-[#2a2b2e] text-gray-300 hover:bg-[#3a3b3e]"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {f.pfp ? (
                          <img
                            src={
                              f.pfp.startsWith("/uploads/")
                                ? `http://localhost:3000${f.pfp}`
                                : f.pfp
                            }
                            alt={displayName}
                            className="h-10 w-10 rounded-full object-cover border border-gray-700 shadow-md mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md mr-3">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{displayName}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm flex items-center">
                <img src={errorIcon} className="w-4 h-4 mr-2" /> {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={props.onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#7289DA] hover:bg-[#5b6eae] disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:shadow-none"
            >
              {isSubmitting ? "Adding..." : "Add to Group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupAdd;
