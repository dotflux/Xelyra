import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import errorIcon from "../../../assets/error.svg";

interface Props {
  setToken: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean;
  onClose: () => void;
}

const VerifyTokenModal = (props: Props) => {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleCancel = () => {
    setPassword("");
    setShowPassword(false);
    setError("");
    props.onClose();
  };

  const onSubmit = async () => {
    if (!id) return;
    if (!password || password.length === 0)
      return setError("This field is required");
    try {
      const res = await axios.post(
        `http://localhost:3000/developer/applications/${id}/bots/fetchToken`,
        { password },
        { withCredentials: true }
      );
      if (res.data.valid) {
        props.setToken(res.data.botToken);
        handleCancel();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
        setError(error.response.data.message);
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
        <h1 className="text-white text-2xl font-bold mb-3">View your token</h1>
        <button
          onClick={props.onClose}
          className="absolute top-2 right-2 text-white hover:text-red-600 px-2"
        >
          X
        </button>
        <div>
          <label className="block text-white mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            maxLength={20}
            className="w-full px-3 py-2 bg-[#0e0f0f] text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          ></input>
          {error && (
            <p className="text-red-500 text-sm mb-2 mt-2 flex items-center">
              <img src={errorIcon} /> {error}
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
            className="rounded bg-blue-500 px-4 py-2 shadow-sm transition-all duration-150"
            onClick={onSubmit}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyTokenModal;
