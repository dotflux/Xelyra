import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import errorIcon from "../../../../assets/error.svg";
import axios from "axios";

interface Friend {
  username: string;
  id: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGroup = (props: Props) => {
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
      if (name.length > 20) {
        setError("Name must be 20 characters or fewer");
        return;
      }
      if (participants.length < 2) {
        setError("Pick at least two friends");
        return;
      }
      setError("");
      setSubmitting(true);
      const response = await axios.post(
        "http://localhost:3000/home/groups/create",
        { name, participants },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        navigate(`/home?channel=${response.data.newId}`);
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-[#18181c] rounded-xl shadow-2xl w-full max-w-md p-7 relative border border-[#23232a]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Group</h2>
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
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#191a1d] border border-[#3a3b3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              placeholder="Enter group name"
            />
            <p className="text-gray-400 text-sm mt-2">{name.length}/20</p>
          </div>

          {/* Selected Participants */}
          {participants.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Selected ({participants.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {participants.map((id) => {
                  const friend = friends && friends.find((f) => f.id === id);
                  return (
                    <span
                      key={id}
                      className="flex items-center bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg"
                    >
                      {friend?.username || id}
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
                friends.map((f) => (
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
                      <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md mr-3">
                        {f.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{f.username}</span>
                    </div>
                  </div>
                ))}
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
              {isSubmitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
