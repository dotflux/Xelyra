import React from "react";

interface UserAvatarProps {
  pfp?: string;
  username: string;
  displayName?: string;
  type?: string;
  onClick?: () => void;
  popupOpen?: boolean;
  setPopupOpen?: (open: boolean) => void;
  popupData?: any;
  anchorRef?: React.RefObject<HTMLDivElement>;
}

const BACKEND_URL = "http://localhost:3000";

const UserAvatar: React.FC<UserAvatarProps> = ({
  pfp,
  username,
  displayName,
  onClick,
  anchorRef,
}) => {
  return (
    <div
      ref={anchorRef}
      className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center cursor-pointer border-2 border-indigo-700/40 shadow"
      onClick={onClick}
      title={username}
    >
      {pfp ? (
        <img
          src={pfp.startsWith("/uploads/") ? `${BACKEND_URL}${pfp}` : pfp}
          alt={username}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="text-lg font-bold text-white">
          {(displayName || username || "?").charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
