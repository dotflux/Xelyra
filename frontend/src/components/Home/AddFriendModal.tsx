import { useState } from "react";
import errorIcon from "../../assets/error.svg";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendModal = ({ isOpen, onClose }: Props) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/home/requests/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recieverName: name }),
      });
      const data = await response.json();
      if (!data.valid) {
        setError(data.message || "Unknown error");
      } else {
        onClose();
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Network Error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#23232a] rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4">Add Friend</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="px-4 py-2 rounded-lg bg-[#18191c] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-1">
              <img src={errorIcon} alt="Error" className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold shadow transition"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal;
