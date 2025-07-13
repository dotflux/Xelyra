import React from "react";
import ServerSettings from "./ServerSettings";

interface ServerSettingsOverlayProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ServerSettingsOverlay: React.FC<ServerSettingsOverlayProps> = ({
  serverId,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return <ServerSettings serverId={serverId} onClose={onClose} />;
};

export default ServerSettingsOverlay;
