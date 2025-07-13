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
    [key: string]: any;
  };
  anchorRef?: React.RefObject<HTMLDivElement>;
}

const DISCORD_GRAY = "#232428";
const DISCORD_CARD_BORDER = "#36393f";
const DISCORD_CARD_WIDTH = 320;
const DISCORD_CARD_HEIGHT = 370;

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
  const hasTheme = senderData.primary_theme && senderData.secondary_theme;
  const bannerBg = hasTheme
    ? `linear-gradient(135deg, ${senderData.primary_theme}, ${senderData.secondary_theme})`
    : DISCORD_GRAY;
  const cardBorder = hasTheme
    ? `2px solid ${senderData.secondary_theme}`
    : `2px solid ${DISCORD_CARD_BORDER}`;
  const banner = senderData.banner
    ? senderData.banner.startsWith("/uploads/")
      ? "http://localhost:3000" + senderData.banner
      : senderData.banner
    : null;

  const useDarkText =
    hasTheme &&
    isColorLight(senderData.primary_theme || "") &&
    isColorLight(senderData.secondary_theme || "");
  return (
    <div
      ref={popupRef}
      className="z-50 fixed shadow-2xl rounded-2xl flex flex-col animate-fade-in p-0"
      style={{
        top: position.top,
        left: position.left,
        width: DISCORD_CARD_WIDTH,
        minHeight: DISCORD_CARD_HEIGHT,
        background: hasTheme ? bannerBg : DISCORD_GRAY,
        border: cardBorder,
      }}
    >
      <div
        className="w-full rounded-t-2xl overflow-hidden relative"
        style={{ height: 96, background: bannerBg }}
      >
        {banner ? (
          <img
            src={banner}
            alt="Banner"
            className="w-full h-full object-cover absolute top-0 left-0"
            style={{ zIndex: 1 }}
          />
        ) : null}
      </div>
      {/* Card content row: avatar + text */}
      <div
        className="flex flex-row items-start w-full"
        style={{ padding: "0 24px", marginTop: 20, marginBottom: 12 }}
      >
        <div
          className="w-20 h-20 rounded-full border-4 bg-[#1e1f22] overflow-hidden flex items-center justify-center"
          style={{ borderColor: DISCORD_GRAY }}
        >
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
        <div style={{ marginLeft: 16, marginTop: 12 }}>
          <span
            className={`text-2xl font-extrabold leading-tight truncate ${
              useDarkText ? "text-gray-900" : "text-white"
            }`}
            style={{ display: "block", textAlign: "left" }}
          >
            {senderData.displayName || senderData.username}
          </span>
          <span
            className={`text-base leading-tight truncate ${
              useDarkText ? "text-gray-700" : "text-gray-400"
            }`}
            style={{ display: "block", textAlign: "left" }}
          >
            @{senderData.username}
          </span>
        </div>
      </div>
      {/* Description below */}
      {senderData.description && (
        <div
          className={`w-full text-sm text-left break-words ${
            useDarkText ? "text-gray-700" : "text-gray-300"
          }`}
          style={{ paddingLeft: 120, paddingRight: 24, marginTop: 8 }}
        >
          {senderData.description}
        </div>
      )}
    </div>
  );
};

export default UserPopup;
