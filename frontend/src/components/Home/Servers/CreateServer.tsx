import { useState } from "react";
import { useNavigate } from "react-router-dom";
import errorIcon from "../../../assets/error.svg";
import axios from "axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateServer = (props: Props) => {
  const [name, setName] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async () => {
    try {
      if (!props.isOpen) return;
      if (name.length > 20) {
        setError("Name must be 20 characters or fewer");
        return;
      }
      setError("");
      setSubmitting(true);
      const response = await axios.post(
        "http://localhost:3000/home/servers/create",
        { name },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        navigate(`/home/servers/${response.data.newId}`);
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
      <div className="bg-[#2a2b2e] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-[#3a3b3e] relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Server</h2>
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
              htmlFor="serverName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Server Name
            </label>
            <input
              type="text"
              id="serverName"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#191a1d] border border-[#3a3b3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              placeholder="Enter server name (Optional)"
            />
            <p className="text-gray-400 text-sm mt-2">{name.length}/20</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mb-2 flex items-center">
              <img src={errorIcon} className="h-4 w-4 mr-2" /> {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={props.onClose}
              className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServer;
