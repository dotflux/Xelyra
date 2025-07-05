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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          Create Server
        </h2>
        <button
          onClick={props.onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          X
        </button>

        {/* Server Name Input */}
        <div className="mb-4">
          <label className="block text-white mb-1">Server Name</label>
          <input
            type="text"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter server name (Optional)"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-gray-400 text-sm mt-1">{name.length}/20</p>
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

export default CreateServer;
