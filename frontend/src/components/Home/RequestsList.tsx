import { useState, useEffect } from "react";
import checkIcon from "../../assets/check.svg";
import crossIcon from "../../assets/cross.svg";
import errorIcon from "../../assets/error.svg";
import axios from "axios";

interface RequestInfo {
  id: string;
  username: string;
  pfp: string;
}

const RequestsList = () => {
  const [requests, setRequests] = useState<RequestInfo[]>([]);
  const [error, setError] = useState("");

  const onMount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/home/requests",
        {},
        {
          withCredentials: true,
        }
      );
      if (response.data.valid) {
        setRequests(response.data.requests);
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

  const handleAccept = async (id: string) => {
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:3000/home/requests/accept",
        { recieverId: id },
        { withCredentials: true }
      );
      if (!response.data.valid) {
        setError(response.data.message || "Unknown error");
      } else {
        setRequests(requests.filter((r) => r.id !== id));
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message);
      } else {
        setError("Network Error");
      }
    }
  };

  const handleReject = async (id: string) => {
    setError("");
    if (!id) return;
    try {
      const response = await axios.post(
        "http://localhost:3000/home/requests/reject",
        { recieverId: id },
        { withCredentials: true }
      );
      if (!response.data.valid) {
        setError(response.data.message || "Unknown error");
      } else {
        setRequests(requests.filter((r) => r.id !== id));
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message);
      } else {
        setError("Network Error");
      }
    }
  };

  return (
    <ul className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {requests.length === 0 && !error && (
        <li className="text-gray-400 text-center py-8 select-none">
          No friend requests found.
        </li>
      )}
      {requests.map((req, i) => (
        <li
          key={i}
          className="flex items-center p-2 rounded-2xl bg-[#18191c] border border-white/30 shadow-lg hover:shadow-xl hover:border-white/60 transition-all duration-200 group min-w-0 backdrop-blur-md hover:scale-[1.025]"
          style={{ minHeight: 56 }}
        >
          <div className="relative h-10 w-10 flex items-center justify-center">
            {req.pfp ? (
              <img
                src={
                  req.pfp.startsWith("/uploads/")
                    ? `http://localhost:3000${req.pfp}`
                    : req.pfp
                }
                alt={req.username}
                className="h-10 w-10 rounded-full object-cover border border-gray-700 shadow-md"
              />
            ) : (
              <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-base font-bold text-white shadow-md">
                {req.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="ml-4 text-gray-100 font-semibold flex-1 group-hover:text-white transition-colors duration-200 truncate min-w-0 text-[15px]">
            {req.username}
          </span>
          <div className="flex gap-2 ml-2">
            <button
              className="p-2 h-10 w-10 flex items-center justify-center rounded-full bg-[#23232a]/70 hover:bg-green-600/80 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-green-500/30 shadow-md group"
              title="Accept"
              onClick={() => handleAccept(req.id)}
            >
              <img
                src={checkIcon}
                className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button
              className="p-2 h-10 w-10 flex items-center justify-center rounded-full bg-[#23232a]/70 hover:bg-red-600/80 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-red-500/30 shadow-md group"
              title="Decline"
              onClick={() => handleReject(req.id)}
            >
              <img
                src={crossIcon}
                className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </button>
          </div>
        </li>
      ))}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mt-1">
          <img src={errorIcon} alt="Error" className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </ul>
  );
};

export default RequestsList;
