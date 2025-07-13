import { useState, useEffect, useRef } from "react";
import editIcon from "../../../assets/edit.svg";
import deleteIcon from "../../../assets/trash.svg";
import axios from "axios";
import EditMessage from "./EditMessage";
import replyIcon from "../../../assets/reply.svg";
import Embed from "./Embed";
import UserPopup from "./UserPopup";
import UserAvatar from "./Message/UserAvatar";
import ReplyBar from "./Message/ReplyBar";
import MessageActions from "./Message/MessageActions";
import MessageContent from "./Message/MessageContent";
import TimestampLabel from "./Message/TimestampLabel";
import {
  parseMessageFormatting,
  parseLinesWithHeadings,
  parseInlineFormatting,
  parseMessage,
  parseFullMessage,
  parseBlockLines,
  Spoiler,
} from "../../../utils/messageFormatting";

interface Sender {
  username: string;
  type: string;
  displayName: string;
  pfp?: string;
}

interface Props {
  user: string;
  id: string;
  message: string;
  createdAt: string;
  createdAtTimestamp: string;
  grouped: boolean;
  edited: boolean;
  conversation: string;
  userId: string;
  setRepliedTo: React.Dispatch<React.SetStateAction<string | null>>;
  setRepliedContent: React.Dispatch<React.SetStateAction<string>>;
  repliedTo: string | null;
  files?: any[];
  setRepliedSenderType?: React.Dispatch<React.SetStateAction<string | null>>;
  embeds?: string[] | object[];
}

const BACKEND_URL = "http://localhost:3000";

const MessageBox = (props: Props) => {
  const [senderInfo, setSenderInfo] = useState<Sender | null>(null);
  const [editing, setEditing] = useState(false);
  const [repliedContent, setMsgRepliedContent] = useState<string | null>(null);
  const [repliedUsername, setRepliedUsername] = useState<string | null>(null);
  const [repliedPfp, setRepliedPfp] = useState<string | null>(null);
  const [repliedDisplayName, setRepliedDisplayName] = useState<string | null>(
    null
  );
  const [imageDims, setImageDims] = useState<{
    [key: number]: { width: number; height: number };
  }>({});
  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const [userPopupData, setUserPopupData] = useState<any | null>(null);
  const pfpRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  const fetchSender = async () => {
    try {
      if (!props.user) return;
      const response = await axios.post(
        "http://localhost:3000/home/senderInfo",
        { sender: props.user, replyTo: props.repliedTo },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setSenderInfo(response.data.senderData);
        setMsgRepliedContent(response.data.repliedContent);
        setRepliedUsername(response.data.repliedUsername);
        setRepliedPfp(response.data.repliedPfp);
        setRepliedDisplayName(response.data.repliedDisplayName);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  useEffect(() => {
    fetchSender();
  }, [props.user, props.repliedTo]);

  const onDelete = async () => {
    try {
      if (!props.id && !props.conversation) return;
      await axios.post(
        "http://localhost:3000/home/messages/delete",
        { conversation: props.conversation, message: props.id },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  const msgDate = new Date(props.createdAtTimestamp);
  const now = new Date();

  // Build "Today / Yesterday / MM/DD/YYYY" prefix
  let dayLabel: string;
  if (msgDate.toDateString() === now.toDateString()) {
    dayLabel = "";
  } else {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
      dayLabel = "Yesterday at";
    } else {
      const m = msgDate.getMonth() + 1;
      const d = msgDate.getDate();
      const y = msgDate.getFullYear();
      dayLabel = `${m}/${d}/${y} at`;
    }
  }

  // Format time as before
  const time = msgDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePfpClick = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/home/popupInfo",
        { userToFetch: props.user },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.valid) {
        setUserPopupData(response.data.senderData);
        setUserPopupOpen(true);
      }
    } catch (error) {
      // Optionally show error
    }
  };

  return (
    <>
      {/* User Info Popup */}
      <UserPopup
        open={userPopupOpen}
        onClose={() => setUserPopupOpen(false)}
        senderData={userPopupData || {}}
        anchorRef={pfpRef}
      />
      {/* Discord-style reply bar and connector above the username/timestamp */}
      <ReplyBar
        repliedTo={props.repliedTo}
        repliedContent={repliedContent}
        repliedPfp={repliedPfp}
        repliedDisplayName={repliedDisplayName}
        repliedUsername={repliedUsername}
        grouped={props.grouped}
      />
      <div
        className={`group relative flex items-start gap-2 ${
          props.grouped ? "mt-[1px] ml-[8px]" : "mt-3"
        } hover:bg-gray-900/70 px-1 transition-colors duration-150`}
        style={{ lineHeight: "1.2" }}
      >
        {/* Action bar on hover */}
        <MessageActions
          onReply={() => {
            props.setRepliedTo(props.id);
            props.setRepliedContent(props.message);
            if (props.setRepliedSenderType)
              props.setRepliedSenderType(senderInfo?.type || null);
          }}
          onEdit={
            props.userId === props.user ? () => setEditing(true) : undefined
          }
          onDelete={props.userId === props.user ? onDelete : undefined}
          canEdit={props.userId === props.user}
          canDelete={props.userId === props.user}
        />
        {!props.grouped ? (
          <UserAvatar
            pfp={senderInfo?.pfp}
            username={senderInfo?.username || "User"}
            displayName={senderInfo?.displayName}
            onClick={handlePfpClick}
            anchorRef={pfpRef}
          />
        ) : (
          <div className="w-8 flex-none" />
        )}

        <div className="flex flex-col flex-1 min-w-0 relative">
          {!props.grouped && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white truncate">
                {senderInfo?.displayName
                  ? senderInfo.displayName
                  : senderInfo?.username || "Loading..."}
              </span>
              {senderInfo?.type === "bot" && (
                <span className="bg-blue-700 text-xs text-white px-2 py-0.5 rounded ml-1 font-bold tracking-wide">
                  BOT
                </span>
              )}
              {senderInfo?.type === "ai" && (
                <span className="bg-green-700 text-xs text-white px-2 py-0.5 rounded ml-1 font-bold tracking-wide">
                  AI
                </span>
              )}
              <TimestampLabel dayLabel={dayLabel} time={time} />
            </div>
          )}

          {/* message + icon wrapper */}
          <div className="relative w-full">
            {editing ? (
              <EditMessage
                channelId={props.conversation}
                initialText={props.message}
                messageId={props.id}
                onCancel={() => setEditing(false)}
                onEdited={() => setEditing(false)}
              />
            ) : (
              <MessageContent
                message={props.message}
                edited={props.edited}
                files={props.files}
                embeds={props.embeds}
                imageDims={imageDims}
                setImageDims={setImageDims}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageBox;
