import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  serverName: string;
}

const ConfirmServerLeave = (props: Props) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onLeave = async () => {
    if (!props.serverId) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `http://localhost:3000/servers/${props.serverId}/leave`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.data.valid) {
        props.onClose();
        navigate("/home");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
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
        <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">
          Leave Server
        </h2>
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
          aria-label="Close"
        >
          ×
        </button>
        <p className="text-gray-300 mb-6">
          Are you sure you want to leave{" "}
          <span className="font-semibold text-white">{props.serverName}</span>?
        </p>
        <div className="flex justify-end space-x-3 mt-2">
          <button
            onClick={props.onClose}
            className="px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={onLeave}
            className="px-4 py-2 text-white bg-red-700 rounded hover:bg-red-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Leaving…" : "Leave"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmServerLeave;
