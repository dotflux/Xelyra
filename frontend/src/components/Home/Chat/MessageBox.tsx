import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import EditMessage from "./EditMessage";

import UserPopup from "./UserPopup";
import UserAvatar from "./Message/UserAvatar";
import ReplyBar from "./Message/ReplyBar";
import MessageActions from "./Message/MessageActions";
import MessageContent from "./Message/MessageContent";
import TimestampLabel from "./Message/TimestampLabel";

interface Sender {
  username: string;
  type: string;
  displayName: string;
  pfp?: string;
}

interface PopupInfo {
  username: string;
  displayName: string;
  type: string;
  pfp: string;
  description: string;
  banner: string;
  primary_theme: string;
  secondary_theme: string;
  id: string;
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

const MessageBox = (props: Props) => {
  const navigate = useNavigate();
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
  const [userPopupData, setUserPopupData] = useState<PopupInfo | null>(null);
  const pfpRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const [isMember, setIsMember] = useState(false);

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

  const tenorRegex = /https?:\/\/tenor\.com\/view\/.*-(\d+)/;
  const match = props.message.match(tenorRegex);
  const [tenorGifUrl, setTenorGifUrl] = useState<string | null>(null);
  useEffect(() => {
    setTenorGifUrl(null);
    if (match) {
      const gifId = match[1];
      axios
        .post(`http://localhost:3000/home/api/tenor/${gifId}`)
        .then((res) => {
          const data = res.data;
          if (
            data &&
            data.results &&
            data.results[0] &&
            data.results[0].media_formats &&
            data.results[0].media_formats.gif &&
            data.results[0].media_formats.gif.url
          ) {
            setTenorGifUrl(data.results[0].media_formats.gif.url);
          }
        });
    }
  }, [props.message]);

  const inviteRegex = /xelyra\.invite\/([0-9a-fA-F-]{36})/;
  const [inviteInfo, setInviteInfo] = useState<null | {
    server_name: string;
    server_pfp: string;
    server_member: boolean;
    server_id: string;
  }>(null);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    setInviteInfo(null);
    setInviteError(null);
    setIsMember(false);
    const match = props.message.match(inviteRegex);
    if (!match) return;
    const id = match[1];
    setInviteId(id);
    const fetchInvite = async () => {
      try {
        const res = await axios.post(
          "http://localhost:3000/home/servers/invites/fetch",
          { inviteId: id },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!res.data.valid) {
          setInviteError("Invalid Invite");
          return;
        }
        setInviteInfo(res.data.inviteInfo);
        setIsMember(res.data.inviteInfo.server_member);
      } catch (error) {
        setInviteError("Invalid Invite");
        if (axios.isAxiosError(error) && error.response) {
          console.log(error.response.data.message);
        } else {
          console.log("Network Error:", error);
        }
      }
    };
    fetchInvite();
  }, [props.message]);

  const joinServer = async () => {
    if (!inviteInfo || !inviteId || !inviteInfo.server_id) return;
    try {
      const req = await axios.post(
        `http://localhost:3000/servers/${inviteInfo.server_id}/add`,
        { inviteId },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (req.data.valid) {
        setIsMember(true);
        navigate(`/home/servers/${inviteInfo.server_id}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  const renderMessageWithInviteLink = () => {
    if (!props.message) return null;
    const parts = props.message.split(inviteRegex);
    if (parts.length < 2)
      return (
        <MessageContent
          message={
            tenorGifUrl
              ? props.message.replace(tenorRegex, "").trim()
              : props.message.trim()
          }
          edited={props.edited}
          files={props.files}
          embeds={props.embeds}
          imageDims={imageDims}
          setImageDims={setImageDims}
        />
      );
    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i]) elements.push(<span key={i}>{parts[i]}</span>);
      } else {
        elements.push(
          <span key={i} className="text-blue-500 underline break-all">
            xelyra.invite/{parts[i]}
          </span>
        );
      }
    }
    return <span className="whitespace-pre-wrap break-words">{elements}</span>;
  };

  return (
    <>
      {/* User Info Popup */}
      <UserPopup
        open={userPopupOpen}
        onClose={() => setUserPopupOpen(false)}
        senderData={
          userPopupData || {
            pfp: "",
            username: "",
            displayName: "",
            type: "",
            id: "",
          }
        }
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
            props.setRepliedTo(props.createdAt);
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
              <>
                {renderMessageWithInviteLink()}
                {inviteInfo && inviteId && (
                  <div className="flex flex-col items-start border border-[#23232a] rounded-2xl bg-[#23232a] p-4 mb-2 w-full max-w-lg min-w-[320px]">
                    <span className="text-xs font-bold text-gray-300 mb-2 tracking-wide">
                      {props.userId === props.user
                        ? "YOU SENT AN INVITE TO JOIN A SERVER"
                        : "YOU WERE INVITED TO JOIN A SERVER"}
                    </span>
                    <div className="flex items-center w-full mb-2">
                      {inviteInfo.server_pfp ? (
                        <img
                          src={
                            inviteInfo.server_pfp.startsWith("/uploads/")
                              ? `http://localhost:3000${inviteInfo.server_pfp}`
                              : inviteInfo.server_pfp
                          }
                          alt={inviteInfo.server_name}
                          className="h-12 w-12 rounded-xl object-cover bg-gray-700 border border-gray-800 shadow-md flex-none"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md flex-none">
                          {inviteInfo.server_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col ml-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white truncate max-w-[180px]">
                            {inviteInfo.server_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full mt-2">
                      {isMember ? (
                        <button
                          className="w-full text-base font-bold px-3 py-2 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed opacity-70"
                          disabled
                        >
                          Joined
                        </button>
                      ) : (
                        <button
                          className="w-full text-base font-bold px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
                          onClick={joinServer}
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {inviteError && inviteId && (
                  <div className="flex flex-col items-start border border-[#23232a] rounded-2xl bg-[#23232a] p-4 mb-2 w-full max-w-lg min-w-[320px]">
                    <span className="text-xs font-bold text-gray-300 mb-2 tracking-wide">
                      {props.userId === props.user
                        ? "You Sent An Invite, But..."
                        : "You Were Invited, But..."}
                    </span>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="h-12 w-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-3xl text-gray-400">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9l11.21 11.21C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 4.69C8.45 3.63 10.15 3 12 3c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-red-500">
                          Invalid Invite
                        </span>
                        <span className="text-xs text-gray-400">
                          Try sending a new invite!
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {tenorGifUrl && (
                  <div className="mt-2">
                    <img
                      src={tenorGifUrl}
                      alt="GIF"
                      className="rounded-lg max-w-xs"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageBox;
