import { useEffect, useState, useRef } from "react";
import axios from "axios";
import checkIcon from "../../../assets/check.svg";

interface ConvInfo {
  reciever: string;
  id: string;
  recieverPfp?: string;
  displayName?: string;
  last_message_timestamp?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
}

const InviteModal = (props: Props) => {
  const [conversations, setConversations] = useState<ConvInfo[]>([]);
  const [invited, setInvited] = useState<{ [id: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inviteId, setInviteId] = useState("");

  useEffect(() => {
    if (!props.isOpen) return;

    const fetchInviteId = async () => {
      if (!props.serverId) return;
      try {
        const response = await axios.post(
          `http://localhost:3000/servers/${props.serverId}/invites/find`,
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        if (response.data.valid) {
          setInviteId(response.data.inviteId);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.log(error.response.data.message);
        } else {
          console.log("Network Error:", error);
        }
      }
    };
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:3000/home/conversations",
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        if (response.data.valid) {
          setConversations(response.data.convData);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.log(error.response.data.message);
        } else {
          console.log("Network Error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
    fetchInviteId();
  }, [props.isOpen]);

  const onInvite = async (convId: string) => {
    if (!inviteId) return;
    try {
      await axios.post(
        "http://localhost:3000/home/messages/send",
        {
          message: `xelyra.invite/${inviteId}`,
          conversation: convId,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setInvited((prev) => ({ ...prev, [convId]: true }));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };

  if (!props.isOpen) return null;

  const inviteLink = inviteId
    ? `https://xelyra.gg/invite/${inviteId}`
    : "https://xelyra.gg/invite/placeholder";
  const onCopy = () => {
    if (!inputRef.current) return;
    navigator.clipboard.writeText(inputRef.current.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-[#18181c] rounded-xl shadow-2xl w-full max-w-md p-7 relative border border-[#23232a]">
        <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">
          Invite Friends
        </h2>
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
          aria-label="Close"
        >
          ×
        </button>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {isLoading && <div className="text-gray-400">Loading...</div>}
          {!isLoading &&
            conversations
              .slice()
              .sort((a, b) => {
                if (!a.last_message_timestamp && !b.last_message_timestamp)
                  return 0;
                if (!a.last_message_timestamp) return 1;
                if (!b.last_message_timestamp) return -1;
                return (
                  new Date(b.last_message_timestamp).getTime() -
                  new Date(a.last_message_timestamp).getTime()
                );
              })
              .map((conv) => {
                const displayName = conv.displayName || conv.reciever;
                return (
                  <div
                    key={conv.id}
                    className="flex items-center bg-[#23232a] border border-[#23232a] rounded-lg px-4 py-3 shadow-sm"
                  >
                    {conv.recieverPfp ? (
                      <img
                        src={
                          conv.recieverPfp.startsWith("/uploads/")
                            ? `http://localhost:3000${conv.recieverPfp}`
                            : conv.recieverPfp
                        }
                        alt={displayName}
                        className="h-10 w-10 rounded-full object-cover border border-gray-700 shadow-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="ml-3 font-medium text-white truncate min-w-0 flex-1">
                      {displayName}
                    </span>
                    {invited[conv.id] ? (
                      <img
                        src={checkIcon}
                        alt="Invited"
                        className="w-6 h-6 ml-2"
                      />
                    ) : (
                      <button
                        className="ml-2 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm transition disabled:opacity-60"
                        onClick={() => onInvite(conv.id)}
                        disabled={invited[conv.id]}
                      >
                        Invite
                      </button>
                    )}
                  </div>
                );
              })}
        </div>
        <div className="mt-6 bg-[#23232a] rounded-lg p-4 flex flex-col">
          <span className="text-sm font-semibold text-gray-200 mb-2">
            Or, Send A Server Invite Link To A Friend
          </span>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-3 py-2 bg-[#18181c] text-white rounded border border-[#23232a] focus:outline-none text-sm"
            />
            <button
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-sm"
              onClick={onCopy}
            >
              Copy
            </button>
          </div>
          <span className="text-xs text-gray-400 mt-1">
            Your invite link expires in 7 days.
          </span>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
