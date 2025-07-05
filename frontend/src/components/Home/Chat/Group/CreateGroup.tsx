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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-white mb-4">Create Group</h2>
        <button
          onClick={props.onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          X
        </button>

        {/* Group Name Input */}
        <div className="mb-4">
          <label className="block text-white mb-1">Group Name</label>
          <input
            type="text"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-gray-400 text-sm mt-1">{name.length}/20</p>
        </div>

        {/* Selected Participants */}
        {participants.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {participants.map((id) => {
              const friend = friends && friends.find((f) => f.id === id);
              return (
                <span
                  key={id}
                  className="flex items-center bg-indigo-600 text-white px-2 py-1 rounded-full text-sm"
                >
                  {friend?.username || id}
                  <button
                    onClick={() => toggleParticipant(id)}
                    className="ml-2 hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Friend List */}
        <div className="mb-4 max-h-48 overflow-y-auto border border-gray-700 rounded p-2">
          {friends &&
            friends.map((f) => (
              <div
                key={f.id}
                onClick={() => toggleParticipant(f.id)}
                className={`cursor-pointer px-3 py-2 mb-1 rounded ${
                  participants.includes(f.id)
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {f.username}
              </div>
            ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-2 flex items-center">
            <img src={errorIcon} /> {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={props.onClose}
            className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
