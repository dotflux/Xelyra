import React from "react";
import editIcon from "../../../../assets/edit.svg";
import deleteIcon from "../../../../assets/trash.svg";
import replyIcon from "../../../../assets/reply.svg";

interface MessageActionsProps {
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  onReply,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) => (
  <div className="absolute right-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-1 bg-black/60 backdrop-blur-md rounded-xl shadow-lg p-1 border border-gray-800">
    <button
      className="p-1 hover:bg-indigo-700/70 rounded-lg transition-colors"
      title="Reply"
      onClick={onReply}
    >
      <img src={replyIcon} alt="Reply" className="w-5 h-5" />
    </button>
    {canEdit && (
      <button
        className="p-1 hover:bg-indigo-700/70 rounded-lg transition-colors"
        title="Edit"
        onClick={onEdit}
      >
        <img src={editIcon} alt="Edit" className="w-5 h-5" />
      </button>
    )}
    {canDelete && (
      <button
        className="p-1 hover:bg-red-700/70 rounded-lg transition-colors"
        title="Delete"
        onClick={onDelete}
      >
        <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
      </button>
    )}
  </div>
);

export default MessageActions;
