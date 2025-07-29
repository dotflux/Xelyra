import React from "react";
import ServerSettings from "./ServerSettings";

interface ServerSettingsOverlayProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ServerSettingsOverlay: React.FC<ServerSettingsOverlayProps> = ({
  serverId,
  isOpen,
  onClose,
  userId,
}) => {
  if (!isOpen) return null;

  return (
    <ServerSettings serverId={serverId} onClose={onClose} userId={userId} />
  );
};

export default ServerSettingsOverlay;
