import React from "react";

interface CommandAvatarProps {
  botAvatar?: string;
  botName: string;
}

const CommandAvatar: React.FC<CommandAvatarProps> = ({
  botAvatar,
  botName,
}) => {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-2 border-indigo-700/40 shadow">
      {botAvatar ? (
        <img
          src={
            botAvatar.startsWith("/uploads/")
              ? `http://localhost:3000${botAvatar}`
              : botAvatar
          }
          alt={botName}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="text-lg font-bold text-white">
          {(botName || "?").charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default CommandAvatar;
