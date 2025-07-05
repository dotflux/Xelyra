import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-white mb-4">Add To Group</h2>
        <button
          onClick={props.onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          X
        </button>

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
                    X
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
            {isSubmitting ? "Adding" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupAdd;
