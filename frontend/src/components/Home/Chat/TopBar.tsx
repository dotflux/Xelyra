import {
  useEffect,
  useState,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  useSearchParams,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { Socket } from "socket.io-client";
import { useUser } from "../UserContext";
import openSidebarIcon from "../../../assets/openSidebar.svg";
import vcIcon from "../../../assets/vc.svg";

interface Reciever {
  id: string;
  username: string;
  type: string;
  pfp?: string;
  displayName?: string;
}

interface Props {
  showPanel: boolean;
  setShowPanel: Dispatch<SetStateAction<boolean>>;
  onChannelInfoChange?: (info: { name: string; type: string }) => void;
  socket?: Socket | null;
}

const TopBar = (props: Props) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: serverId } = useParams();
  const channel = searchParams.get("channel");
  const [recieverInfo, setReciever] = useState<Reciever | null>(null);

  const handleBackClick = () => {
    const url = new URL(
      location.pathname + location.search,
      window.location.origin
    );
    url.searchParams.delete("channel");
    navigate(url.pathname + url.search);
  };
  const [channelInfo, setChannelInfo] = useState<{
    name: string;
    type: string;
  } | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  // WebRTC State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    conversationId: string;
  } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [waitingForAcceptance, setWaitingForAcceptance] = useState(false);

  // Refs
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const { user } = useUser();

  const onMount = async () => {
    try {
      if (!channel) return;
      if (serverId) {
        const response = await axios.post(
          `http://localhost:3000/servers/${serverId}/channels`,
          {},
          { withCredentials: true }
        );
        if (response.data.valid) {
          for (const cat of response.data.channelsData) {
            const found = cat.channels.find((c: any) => c.id === channel);
            if (found) {
              setChannelInfo({ name: found.name, type: found.type });
              break;
            }
          }
        }
      } else {
        const response = await axios.post(
          "http://localhost:3000/home/recieverInfo",
          { conversation: channel },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.valid) {
          setReciever(response.data.recieverData);
        }
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
    onMount();
  }, [channel, serverId]);

  useEffect(() => {
    if (props.socket?.connected && user?.id) {
      props.socket.emit("joinUser", user.id);
      console.log("Joined user room:", user.id);
    }
  }, [user?.id, props.socket?.connected]);

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      console.log("Setting remote audio stream:", remoteStream);
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((error) => {
        console.error("Error playing remote audio:", error);
      });
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localStream && localAudioRef.current) {
      console.log("Setting local audio stream:", localStream);
      console.log("Local stream tracks:", localStream.getTracks());
      console.log("Local stream active:", localStream.active);
      localAudioRef.current.srcObject = localStream;
      localAudioRef.current.volume = 0.1;
      console.log("Local audio element:", localAudioRef.current);
      console.log("Local audio muted:", localAudioRef.current.muted);
    }
  }, [localStream]);

  useEffect(() => {
    if (props.onChannelInfoChange) {
      if (serverId && channelInfo) {
        props.onChannelInfoChange({
          name: channelInfo.name,
          type: channelInfo.type,
        });
      } else if (recieverInfo) {
        props.onChannelInfoChange({
          name: recieverInfo.username,
          type: recieverInfo.type,
        });
      }
    }
    if (recieverInfo) {
      console.log("TopBar recieverInfo.pfp:", recieverInfo.pfp);
    }
  }, [channelInfo, recieverInfo, serverId]);

  useEffect(() => {
    if (!props.socket) return;

    props.socket.on(
      "incomingCall",
      (data: { callerId: string; conversationId: string }) => {
        console.log("Incoming call from:", data.callerId);
        setIncomingCall(data);
      }
    );

    props.socket.on("callAccepted", (data: { accepterId: string }) => {
      console.log("Call accepted by:", data.accepterId);
      setIsCalling(false);
      setWaitingForAcceptance(false);

      startWebRTCConnection();
    });

    props.socket.on("callRejected", (data: { rejecterId: string }) => {
      console.log("Call rejected by:", data.rejecterId);
      setIsCalling(false);
      setIsInCall(false);
    });

    props.socket.on("offer", async (data: { offer: any }) => {
      console.log("Received WebRTC offer");
      await handleWebRTCOffer(data.offer);
    });

    props.socket.on("answer", async (data: { answer: any }) => {
      console.log("Received WebRTC answer");
      await handleWebRTCAnswer(data.answer);
    });

    props.socket.on("iceCandidate", async (data: { candidate: any }) => {
      console.log("Received ICE candidate");
      await handleICECandidate(data.candidate);
    });

    props.socket.on("callEnded", (data: { enderId: string }) => {
      console.log("Call ended by:", data.enderId);
      endCall();
    });

    return () => {
      props.socket?.off("incomingCall");
      props.socket?.off("callAccepted");
      props.socket?.off("callRejected");
      props.socket?.off("offer");
      props.socket?.off("answer");
      props.socket?.off("iceCandidate");
      props.socket?.off("callEnded");
    };
  }, [props.socket]);

  const getUserMedia = async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      console.log("Got user media stream:", stream);
      return stream;
    } catch (error) {
      console.error("Error getting user media:", error);
      throw error;
    }
  };

  const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate");
        props.socket?.emit("iceCandidate", {
          targetUserId: recieverInfo?.id,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Received remote stream:", event.streams[0]);
      console.log("Remote stream tracks:", event.streams[0].getTracks());
      console.log("Remote stream active:", event.streams[0].active);
      console.log("Remote stream id:", event.streams[0].id);
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state changed:", pc.connectionState);
      if (pc.connectionState === "connected") {
        console.log("WebRTC connection established!");
        setIsInCall(true);
      } else if (pc.connectionState === "failed") {
        console.log("WebRTC connection failed!");
      } else if (pc.connectionState === "disconnected") {
        console.log("WebRTC connection disconnected!");
      }
    };

    return pc;
  };

  const startCall = async () => {
    if (!recieverInfo?.id || !channel || !user?.id) return;

    if (!props.socket?.connected) {
      console.log("Socket not connected, cannot start call");
      setIsCalling(false);
      return;
    }

    props.socket.emit("joinUser", user.id);

    try {
      console.log("Starting call to:", recieverInfo.id);
      setIsCalling(true);
      setWaitingForAcceptance(true);

      const stream = await getUserMedia();
      setLocalStream(stream);
      localStreamRef.current = stream;
      console.log("Set local stream:", stream);

      const pc = createPeerConnection();
      setPeerConnection(pc);
      peerConnectionRef.current = pc;
      console.log("Set peer connection:", pc);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      props.socket.emit("callUser", {
        targetUserId: recieverInfo.id,
        callerId: user.id,
        conversationId: channel,
      });

      setIsInCall(true);
    } catch (error) {
      console.error("Error starting call:", error);
      setIsCalling(false);
      setWaitingForAcceptance(false);
    }
  };

  const startWebRTCConnection = async () => {
    console.log("startWebRTCConnection called");
    console.log("peerConnectionRef.current:", peerConnectionRef.current);
    console.log("localStreamRef.current:", localStreamRef.current);
    console.log("peerConnection state:", peerConnection);
    console.log("localStream state:", localStream);

    const pc = peerConnectionRef.current || peerConnection;
    const stream = localStreamRef.current || localStream;

    if (!pc || !stream) {
      console.log(
        "Cannot start WebRTC connection - missing peer connection or local stream"
      );
      console.log("pc:", pc);
      console.log("stream:", stream);
      return;
    }

    try {
      console.log("Creating WebRTC offer with pc:", pc);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("Sending offer to:", recieverInfo?.id);
      props.socket?.emit("offer", {
        targetUserId: recieverInfo?.id,
        offer: offer,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleWebRTCOffer = async (offer: any) => {
    try {
      console.log("Handling WebRTC offer from:", incomingCall?.callerId);

      if (!peerConnection) {
        console.log("No peer connection, creating new one");
        const pc = createPeerConnection();
        setPeerConnection(pc);

        const stream = await getUserMedia();
        setLocalStream(stream);

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Set remote description (offer)");

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Created and set local description (answer)");

        console.log("Sending answer to:", incomingCall?.callerId);
        props.socket?.emit("answer", {
          targetUserId: incomingCall?.callerId,
          answer: answer,
        });

        setIsInCall(true);
        setIncomingCall(null);
      } else {
        console.log("Using existing peer connection");
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        console.log("Set remote description (offer)");

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        console.log("Created and set local description (answer)");

        console.log("Sending answer to:", incomingCall?.callerId);
        props.socket?.emit("answer", {
          targetUserId: incomingCall?.callerId,
          answer: answer,
        });

        setIsInCall(true);
        setIncomingCall(null);
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleWebRTCAnswer = async (answer: any) => {
    try {
      console.log("Handling WebRTC answer");
      console.log("Current peerConnection:", peerConnection);
      console.log("peerConnectionRef.current:", peerConnectionRef.current);

      const pc = peerConnectionRef.current || peerConnection;

      if (pc) {
        console.log("Setting remote description (answer)");
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("Remote description set successfully");
        setIsInCall(true);
      } else {
        console.error("No peer connection available for answer");
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleICECandidate = async (candidate: any) => {
    try {
      console.log("Handling ICE candidate");
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      console.log("Accepting call from:", incomingCall.callerId);

      const stream = await getUserMedia();
      setLocalStream(stream);

      const pc = createPeerConnection();
      setPeerConnection(pc);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      props.socket?.emit("callAccepted", {
        targetUserId: incomingCall.callerId,
        accepterId: user?.id,
      });

      setIsInCall(true);
      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const rejectCall = () => {
    if (!incomingCall) return;

    props.socket?.emit("callRejected", {
      targetUserId: incomingCall.callerId,
      rejecterId: user?.id,
    });

    setIncomingCall(null);
  };

  const endCall = () => {
    console.log("Ending call");

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    setRemoteStream(null);
    setIsInCall(false);
    setIsCalling(false);
    setIsMuted(false);

    if (recieverInfo?.id) {
      props.socket?.emit("endCall", {
        targetUserId: recieverInfo.id,
        enderId: user?.id,
      });
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log("Microphone:", audioTrack.enabled ? "unmuted" : "muted");
      }
    }
  };

  return (
    <div className="flex items-center space-x-4 w-full p-2 bg-[#191a1d] border-b border-[#2a2b2e] shadow-lg min-h-[44px]">
      <button
        onClick={handleBackClick}
        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors mr-2"
        title="Back"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {serverId && channelInfo ? (
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#23232b] mr-2">
          {channelInfo.type === "voice" ? (
            <img src={vcIcon} alt="vc" className="w-5 h-5" />
          ) : (
            <span className="text-xl text-indigo-300 font-bold">#</span>
          )}
        </div>
      ) : recieverInfo?.pfp ? (
        <img
          src={
            recieverInfo.pfp.startsWith("/uploads/")
              ? `http://localhost:3000${recieverInfo.pfp}`
              : recieverInfo.pfp.startsWith("http")
              ? recieverInfo.pfp
              : `http://localhost:3000/uploads/${recieverInfo.pfp}`
          }
          alt={recieverInfo.displayName || recieverInfo.username}
          className="h-8 w-8 rounded-full object-cover shadow-md mr-2"
        />
      ) : (
        <div className="h-8 w-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-base font-bold text-white shadow-md mr-2">
          {(recieverInfo?.displayName || recieverInfo?.username || "?")
            .charAt(0)
            .toUpperCase()}
        </div>
      )}

      <div className="flex flex-col justify-center">
        <h1 className="text-white font-bold text-[15px] leading-tight">
          {serverId && channelInfo
            ? channelInfo.name
            : recieverInfo?.displayName ||
              recieverInfo?.username ||
              "Loading..."}
        </h1>
        <span className="text-gray-400 text-xs leading-tight">
          {serverId && channelInfo
            ? channelInfo.type === "voice"
              ? "Voice Channel"
              : "Text Channel"
            : recieverInfo?.type === "group"
            ? "Group"
            : recieverInfo?.type === "ai"
            ? "Your AI Assistant"
            : "Direct Message"}
        </span>
      </div>

      <div className="ml-auto flex items-center space-x-2">
        {recieverInfo?.type !== "group" &&
          recieverInfo?.type !== "ai" &&
          !serverId && (
            <div
              className="cursor-pointer p-1.5 hover:bg-gray-900 rounded-lg transition-all duration-200 hover:scale-110"
              onClick={() => {
                if (isInCall) {
                  endCall();
                } else if (incomingCall) {
                  acceptCall();
                } else {
                  startCall();
                }
              }}
            >
              <svg
                className={`h-4 w-4 transition-all duration-200 ${
                  isInCall
                    ? "text-red-500 opacity-100"
                    : incomingCall
                    ? "text-yellow-500 opacity-100"
                    : "text-green-500 opacity-70 hover:opacity-100"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19c-.54 0-.99.45-.99.99 0 9.36 7.59 16.95 16.95 16.95.54 0 .99-.45.99-.99v-3.45c0-.54-.45-.99-.99-.99z" />
              </svg>
            </div>
          )}

        {incomingCall && (
          <div className="flex items-center space-x-2 bg-yellow-600 px-3 py-1 rounded-lg">
            <span className="text-white text-sm">Incoming call...</span>
            <button
              onClick={rejectCall}
              className="text-white hover:text-red-300 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        <div
          className="cursor-pointer p-1.5 hover:bg-gray-900 rounded-lg transition-all duration-200 hover:scale-110"
          onClick={() => {
            props.setShowPanel(true);
          }}
        >
          <img
            src={openSidebarIcon}
            className="h-4 w-4 opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      <audio ref={localAudioRef} autoPlay />
      <audio ref={remoteAudioRef} autoPlay />

      {isInCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#2f3136] rounded-lg p-6 w-80 max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#5865f2] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19c-.54 0-.99.45-.99.99 0 9.36 7.59 16.95 16.95 16.95.54 0 .99-.45.99-.99v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">
                {recieverInfo?.displayName ||
                  recieverInfo?.username ||
                  "Voice Call"}
              </h3>
              <p className="text-gray-400 text-sm">
                {waitingForAcceptance ? "Calling..." : "Connected"}
              </p>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              {!waitingForAcceptance && (
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isMuted
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {isMuted ? (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                    </svg>
                  )}
                </button>
              )}

              <button
                onClick={endCall}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-xs">
                {waitingForAcceptance
                  ? "Waiting for answer..."
                  : isMuted
                  ? "You are muted"
                  : "You are unmuted"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
