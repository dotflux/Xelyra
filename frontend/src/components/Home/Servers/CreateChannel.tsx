import { useState } from "react";
import { useNavigate } from "react-router-dom";
import errorIcon from "../../../assets/error.svg";
import axios from "axios";
import { useParams } from "react-router-dom";
import vcIcon from "../../../assets/vc.svg";
import messageIcon from "../../../assets/message.svg";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
}

const CreateChannel = (props: Props) => {
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<"text" | "voice">("text");
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

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
        `http://localhost:3000/servers/${id}/channels/create`,
        { name, type, category: props.categoryId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        navigate(`/home/servers/${id}?channel=${response.data.newId}`);
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

  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-[#18181c] rounded-xl shadow-2xl w-full max-w-md p-7 relative border border-[#23232a]">
        {/* Header */}
        <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">
          Create Channel
        </h2>
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
          aria-label="Close"
        >
          ×
        </button>

        {/* Channel Name Input */}
        <div className="mb-5">
          <label className="block text-white mb-2 font-medium">
            Channel Name
          </label>
          <input
            type="text"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter channel name"
            className="w-full px-3 py-2 bg-[#23232a] text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 border border-[#23232a]"
          />
          <p className="text-gray-500 text-xs mt-1">{name.length}/20</p>
        </div>

        {/* Channel Type Radio */}
        <div className="mb-6">
          <label className="block text-white mb-2 font-medium">
            Channel Type
          </label>
          <div className="flex space-x-4">
            <label
              className={`flex items-center px-3 py-2 rounded cursor-pointer transition ${
                type === "text"
                  ? "bg-[#23232a] border border-indigo-600"
                  : "bg-[#23232a] border border-transparent"
              }`}
            >
              <input
                type="radio"
                name="channelType"
                value="text"
                checked={type === "text"}
                onChange={() => setType("text")}
                className="form-radio text-indigo-600 hidden"
              />
              <img src={messageIcon} alt="Text" className="w-5 h-5 mr-2" />
              <span className="text-white">Text</span>
            </label>
            <label
              className={`flex items-center px-3 py-2 rounded cursor-pointer transition ${
                type === "voice"
                  ? "bg-[#23232a] border border-indigo-600"
                  : "bg-[#23232a] border border-transparent"
              }`}
            >
              <input
                type="radio"
                name="channelType"
                value="voice"
                checked={type === "voice"}
                onChange={() => setType("voice")}
                className="form-radio text-indigo-600 hidden"
              />
              <img src={vcIcon} alt="Voice" className="w-5 h-5 mr-2" />
              <span className="text-white">Voice</span>
            </label>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-3 flex items-center">
            <img src={errorIcon} className="w-4 h-4 mr-1" /> {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-2">
          <button
            onClick={props.onClose}
            className="px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-white bg-indigo-700 rounded hover:bg-indigo-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannel;
