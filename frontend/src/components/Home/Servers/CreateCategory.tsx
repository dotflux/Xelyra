import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCategory = (props: Props) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const { id } = useParams();

  const onSubmit = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (name.length > 20) {
      setError("Name must be 20 characters or fewer");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/servers/${id}/category/create`,
        { name },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.valid) {
        props.onClose();
      } else {
        setError(response.data.message || "Failed to create category");
      }
    } catch (err) {
      setError("Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  if (!props.isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="bg-[#18181c] rounded-xl shadow-2xl w-full max-w-md p-7 relative border border-[#23232a]">
        <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">
          Create Category
        </h2>
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
          aria-label="Close"
        >
          ×
        </button>
        <div className="mb-5">
          <label className="block text-white mb-2 font-medium">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="w-full px-3 py-2 bg-[#23232a] text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 border border-[#23232a]"
          />
          <p className="text-gray-500 text-xs mt-1">{name.length}/20</p>
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
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

export default CreateCategory;
