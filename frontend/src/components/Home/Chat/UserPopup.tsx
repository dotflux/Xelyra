import React, { useEffect, useRef } from "react";

interface UserPopupProps {
  open: boolean;
  onClose: () => void;
  senderData: {
    pfp: string;
    username: string;
    displayName: string;
    type: string;
    description?: string;
    [key: string]: any;
  };
  anchorRef?: React.RefObject<HTMLDivElement>;
}

const UserPopup: React.FC<UserPopupProps> = ({
  open,
  onClose,
  senderData,
  anchorRef,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{ top: number; left: number }>(
    { top: 0, left: 0 }
  );

  useEffect(() => {
    if (open && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + 12 + window.scrollX, // 12px gap to the right
      });
    }
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        (!anchorRef?.current ||
          !anchorRef.current.contains(event.target as Node))
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose, anchorRef]);

  if (!open) return null;
  return (
    <div
      ref={popupRef}
      className="z-50 fixed shadow-2xl rounded-2xl border border-[#23232a] bg-[#23232a] min-w-[260px] max-w-xs p-5 flex flex-col items-center animate-fade-in"
      style={{ top: position.top, left: position.left }}
    >
      <div className="w-20 h-20 rounded-full bg-[#18191c] flex items-center justify-center border-4 border-indigo-700 shadow-lg overflow-hidden mb-3">
        {senderData.pfp ? (
          <img
            src={
              senderData.pfp && senderData.pfp.startsWith("/uploads/")
                ? "http://localhost:3000" + senderData.pfp
                : senderData.pfp
            }
            alt={senderData.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl text-gray-500 font-bold">
            {senderData.username?.[0]?.toUpperCase() || "?"}
          </span>
        )}
      </div>
      <div className="flex flex-col items-center gap-1 mb-2 w-full">
        <span className="text-lg font-bold text-white flex items-center gap-2">
          {senderData.displayName || senderData.username}
          {senderData.type === "bot" && (
            <span className="ml-2 px-2 py-0.5 bg-indigo-700 text-xs rounded text-white font-semibold">
              BOT
            </span>
          )}
          {senderData.type === "ai" && (
            <span className="ml-2 px-2 py-0.5 bg-green-700 text-xs rounded text-white font-semibold">
              AI
            </span>
          )}
        </span>
        <span className="text-gray-400 text-xs">@{senderData.username}</span>
      </div>
      {senderData.description && (
        <div className="w-full mt-2 text-gray-300 text-sm text-center px-2 break-words">
          {senderData.description}
        </div>
      )}
    </div>
  );
};

export default UserPopup;
