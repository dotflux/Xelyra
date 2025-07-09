import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import CreateApplicationModal from "./CreateApplicationModal";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { UserContext } from "./Developer";

interface Application {
  app_id: string;
  app_name: string;
  app_pfp: string;
}

// Removed ApplicationsListProps

const ApplicationsList = () => {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const user = useContext(UserContext);

  const fetchApplications = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/developer/applications/fetch",
        {},
        { withCredentials: true }
      );
      if (res.data.valid) {
        setApplications(res.data.userApplications);
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
    if (user) {
      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    console.log("userId", user.id);
    socketRef.current = io("http://localhost:3000/messages", {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
      socketRef.current?.emit("joinUser", user.id);
      console.log("Joining user room:", user.id);
    });

    // Listen for appCreated event
    const handleAppCreated = (data: { userId: string }) => {
      fetchApplications();
      console.log("fetched realtime");
    };
    socketRef.current.on("appCreated", handleAppCreated);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  if (!applications)
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-2xl">Applications</h1>
        </div>
        <p className="text-gray-400 text-xl mt-2 mb-4">
          You have no applications yet. Create your first app!
        </p>
        <div className="w-full flex flex-col items-center justify-center py-16 select-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-indigo-400 opacity-70 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20h.01M12 4v16m8-8H4"
            />
          </svg>
          <div className="text-2xl font-bold text-indigo-300 mb-2">
            No Applications Yet
          </div>
          <div className="text-gray-400 text-base max-w-md mx-auto mb-4">
            You haven&apos;t created any apps for Xelyra yet.
            <br />
            Click &quot;Create App&quot; to get started!
          </div>
          <button
            className="rounded-lg text-sm font-medium shadow-sm transition-all duration-150 cursor-pointer bg-blue-600 flex items-end justify-end px-6 py-2 text-white mt-2"
            onClick={() => setIsOpen(true)}
          >
            Create App
          </button>
        </div>
        <CreateApplicationModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
        />
      </div>
    );
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white font-bold text-2xl">Applications</h1>
        <button
          className="rounded-lg text-sm font-medium shadow-sm transition-all duration-150 cursor-pointer bg-blue-600 flex items-end justify-end ml-auto px-4 py-2 text-white"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Create App
        </button>
      </div>
      <p className="text-gray-400 text-xl mt-2 mb-4">
        Develop customizable apps for Xelyra.
      </p>

      <h1 className="text-white font-bold text-2xl mt-6 mb-4">
        My applications
      </h1>

      <div className="flex flex-wrap gap-6">
        {applications.map((app) => (
          <div
            key={app.app_id}
            className="cursor-pointer transition-transform duration-200 transform hover:scale-120"
            onClick={() => {
              navigate(
                `/developer/development/applications/${app.app_id}/overview`
              );
            }}
          >
            <div className="flex flex-col items-center w-32 p-4 bg-[#0d0d0e] rounded-2xl shadow-sm hover:shadow-md transition-shadow min-h-0">
              {/* Icon circle with first letter */}
              <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl font-semibold text-white">
                {app.app_name.charAt(0).toUpperCase()}
              </div>
              {/* App name, truncated if longer than 15 chars */}
              <div
                className="mt-2 w-full text-center text-sm font-medium truncate text-white"
                style={{ maxWidth: "100%" }}
              >
                {app.app_name.length > 15
                  ? `${app.app_name.slice(0, 15)}…`
                  : app.app_name}
              </div>
            </div>
          </div>
        ))}
      </div>
      <CreateApplicationModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </div>
  );
};

export default ApplicationsList;
