import React from "react";
import { useUser } from "./UserContext";

const BelowBar: React.FC = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="w-60 min-h-14 mb-2">
      <div className="flex items-center bg-[#232428]/95 border border-[#2a2b2e] rounded-2xl px-5 py-3 shadow-2xl gap-x-4">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <span className="font-medium text-white text-base leading-5 truncate">
            {user.username}
          </span>
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </span>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button
            className="p-2 rounded-full hover:bg-[#282a2e] transition-colors text-gray-400 hover:text-white"
            title="Voice Settings"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.5v-13m0 0l-3.5 3.5m3.5-3.5l3.5 3.5"
              />
            </svg>
          </button>
          <button
            className="p-2 rounded-full hover:bg-[#282a2e] transition-colors text-gray-400 hover:text-white"
            title="Audio Settings"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10v4m-6-4v4m-2 4h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            className="p-2 rounded-full hover:bg-[#282a2e] transition-colors text-gray-400 hover:text-white"
            title="User Settings"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm7.5-3.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BelowBar;
