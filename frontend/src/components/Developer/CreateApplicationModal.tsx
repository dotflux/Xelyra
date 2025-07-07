import { useState } from "react";
import errorIcon from "../../assets/error.svg";
import axios from "axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}
const CreateApplicationModal = (props: Props) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleCancel = () => {
    setName("");
    setError("");
    props.onClose();
  };

  const handleSave = async () => {
    if (!name || name.length === 0) {
      return setError("This field is required");
    }
    if (name.length > 20) {
      return setError("Name must be 20 or less characters");
    }
    try {
      const res = await axios.post(
        "http://localhost:3000/developer/applications/create",
        { name },
        { withCredentials: true }
      );
      if (res.data.valid) {
        setName("");
        setError("");
        props.onClose();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  if (!props.isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={props.onClose}
    >
      <div
        className="bg-[#141516] rounded-xl p-6 shadow-lg w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <h1 className="text-white text-2xl font-bold mb-3">
          Create An Application
        </h1>
        <button
          onClick={props.onClose}
          className="absolute top-2 right-2 text-white hover:text-red-600 px-2"
        >
          X
        </button>
        <div>
          <label className="block text-white mb-1">Name</label>
          <input
            type="text"
            placeholder="Enter app name"
            value={name}
            maxLength={20}
            className="w-full px-3 py-2 bg-[#0e0f0f] text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => {
              setName(e.target.value);
            }}
          ></input>
          {error && (
            <p className="text-red-500 text-sm mb-2 mt-2 flex items-center">
              <img src={errorIcon} className="w-4 h-4 mr-1" /> {error}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end ml-auto gap-4 mt-4">
          <button
            className="hover:underline text-gray-300 text-sm"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="rounded bg-blue-500 px-4 py-2 shadow-sm transition-all duration-150 text-white hover:bg-blue-600"
            onClick={handleSave}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateApplicationModal;
