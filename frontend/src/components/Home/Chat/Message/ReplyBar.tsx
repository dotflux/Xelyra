import React from "react";

interface ReplyBarProps {
  repliedTo: string | null;
  repliedContent: string | null;
  repliedPfp: string | null;
  repliedDisplayName: string | null;
  repliedUsername: string | null;
  grouped: boolean;
}

const BACKEND_URL = "http://localhost:3000";

const ReplyBar: React.FC<ReplyBarProps> = ({
  repliedTo,
  repliedContent,
  repliedPfp,
  repliedDisplayName,
  repliedUsername,
  grouped,
}) => {
  if (!repliedTo || !repliedContent || grouped) return null;
  return (
    <div
      className="relative flex items-stretch mt-4 mb-1 ml-7"
      style={{ minHeight: "20px" }}
    >
      <svg
        width="32"
        height="20"
        viewBox="0 0 32 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-[-32px] bottom-0 z-10 pointer-events-none"
        style={{ height: "18px", width: "32px" }}
      >
        <path
          d="M16 20 V10 Q16 2 28 2 H32"
          stroke="#818cf8"
          strokeWidth="2"
          fill="none"
          className="drop-shadow-glow"
        />
      </svg>
      <div className="flex items-center gap-2 flex-1 pl-2 border-l-2 border-indigo-400/60">
        {repliedPfp ? (
          <img
            src={
              repliedPfp.startsWith("/uploads/")
                ? `${BACKEND_URL}${repliedPfp}`
                : repliedPfp
            }
            alt={repliedDisplayName || repliedUsername || "User"}
            className="w-6 h-6 rounded-full object-cover border border-indigo-400/40 shadow"
          />
        ) : (
          <div className="w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-white shadow">
            {(repliedDisplayName || repliedUsername || "?")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}
        <span
          className="text-xs font-semibold text-indigo-300 truncate max-w-[100px]"
          title={repliedDisplayName || repliedUsername || undefined}
        >
          {repliedDisplayName || repliedUsername || "User"}
        </span>
        <span
          className="text-xs text-indigo-200 italic opacity-90 flex-1 min-w-0 truncate"
          title={repliedContent || undefined}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
          }}
        >
          {repliedContent || ""}
        </span>
      </div>
    </div>
  );
};

export default ReplyBar;
