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
    banner?: string;
    primary_theme?: string;
    secondary_theme?: string;
    id: string;
    [key: string]: any;
  };
  anchorRef?: React.RefObject<HTMLElement | null>;
}

function isColorLight(hex: string) {
  if (!hex) return false;
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 186;
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
      setTimeout(() => {
        if (popupRef.current) {
          const popupRect = popupRef.current.getBoundingClientRect();
          const spaceBelow = window.innerHeight - (rect.bottom + 12);
          const spaceAbove = rect.top;
          let top = rect.top + window.scrollY;
          if (spaceBelow < popupRect.height && spaceAbove > popupRect.height) {
            top = rect.top + window.scrollY - popupRect.height + rect.height;
          } else {
            top = rect.bottom + window.scrollY + 4;
          }
          setPosition({
            top,
            left: rect.right + 12 + window.scrollX,
          });
        }
      }, 0);
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

  const banner = senderData.banner
    ? senderData.banner.startsWith("/uploads/")
      ? "http://localhost:3000" + senderData.banner
      : senderData.banner
    : null;

  return (
    <div
      ref={popupRef}
      className="z-50 fixed shadow-2xl rounded-xl flex flex-col animate-fade-in overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: 320,
        background:
          senderData.primary_theme && senderData.secondary_theme
            ? `linear-gradient(135deg, ${senderData.primary_theme}, ${senderData.secondary_theme})`
            : "#1e1f22",
        border: "1px solid #3a3b3e",
      }}
    >
      {/* Dynamic text color based on theme brightness */}
      <style>
        {`
            .theme-text {
              color: ${
                isColorLight(senderData.primary_theme || "#1e1f22")
                  ? "#000000"
                  : "#ffffff"
              } !important;
            }
            .theme-text-secondary {
              color: ${
                isColorLight(senderData.primary_theme || "#1e1f22")
                  ? "#374151"
                  : "#9ca3af"
              } !important;
            }
            .theme-button {
              color: ${
                isColorLight(senderData.primary_theme || "#1e1f22")
                  ? "#374151"
                  : "#9ca3af"
              } !important;
            }
            .theme-button:hover {
              color: ${
                isColorLight(senderData.primary_theme || "#1e1f22")
                  ? "#000000"
                  : "#ffffff"
              } !important;
              background-color: ${
                isColorLight(senderData.primary_theme || "#1e1f22")
                  ? "#d1d5db"
                  : "#2a2b2e"
              } !important;
            }
            .theme-id-bg {
              background-color: ${
                isColorLight(senderData.primary_theme || "#1e1f22")
                  ? "#d1d5db"
                  : "#3a3b3e"
              } !important;
            }
            .theme-id-text {
              color: ${
                isColorLight(senderData.primary_theme || "#1e1f22")
                  ? "#374151"
                  : "#9ca3af"
              } !important;
            }
          `}
      </style>
      {/* Banner Section */}
      <div
        className="relative h-24"
        style={{
          background: banner
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : senderData.primary_theme && senderData.secondary_theme
            ? `linear-gradient(90deg, ${senderData.primary_theme}, ${senderData.secondary_theme})`
            : "#2a2b2e",
        }}
      >
        {banner && (
          <img
            src={banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
        {banner && <div className="absolute inset-0 bg-black/20" />}
      </div>

      {/* Avatar Section */}
      <div className="relative px-4 pb-4">
        <div className="flex items-end">
          <div className="relative -mt-12">
            <div className="w-20 h-20 rounded-full border-4 border-[#1e1f22] bg-[#2a2b2e] overflow-hidden flex items-center justify-center shadow-lg">
              {senderData.pfp ? (
                <img
                  src={
                    senderData.pfp.startsWith("/uploads/")
                      ? "http://localhost:3000" + senderData.pfp
                      : senderData.pfp
                  }
                  alt={senderData.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-500 font-bold">
                  {senderData.username?.[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold theme-text truncate">
              {senderData.displayName || senderData.username}
            </h3>
            {senderData.type === "bot" && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-medium">
                BOT
              </span>
            )}
          </div>
          <p className="text-sm theme-text-secondary mb-3">
            @{senderData.username}
          </p>

          {/* Description */}
          {senderData.description && (
            <div
              className="rounded-lg p-3 mb-3"
              style={{
                background: isColorLight(senderData.primary_theme || "#1e1f22")
                  ? "#e5e7eb"
                  : "#2a2b2e",
              }}
            >
              <p className="text-sm theme-text-secondary leading-relaxed">
                {senderData.description}
              </p>
            </div>
          )}

          {/* Copy User ID Button */}
          <div className="border-t border-[#3a3b3e] pt-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(senderData.id);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm theme-button"
            >
              <div className="w-6 h-6 rounded flex items-center justify-center theme-id-bg">
                <span className="text-xs font-medium theme-id-text">ID</span>
              </div>
              Copy User ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPopup;
