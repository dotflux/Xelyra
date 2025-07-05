import { useState } from "react";
import HomeBg from "./HomeBG";
import ServersList from "./ServersList";
import FriendList from "./FriendList";
import ConversationsList from "./ConversationsList";
import ChatWindow from "./Chat/ChatWindow";
import { useSearchParams } from "react-router-dom";
import { useUser } from "./UserContext";

const Home = () => {
  const [searchParams] = useSearchParams();
  const [showFriendsOverlay, setShowFriendsOverlay] = useState(false);
  const channel = searchParams.get("channel");
  const { user } = useUser();

  if (!user) return "Loading..";

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <HomeBg />

      {/* FriendList toggle button shown only on mobile */}
      {!channel && (
        <button
          onClick={() => setShowFriendsOverlay(true)}
          className="sm:hidden fixed bottom-4 right-4 z-20 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg"
          title="Open Friends"
        >
          F
        </button>
      )}

      <div className="relative z-10 flex h-full">
        {/* 1) ServersList */}
        <div className={channel ? "hidden sm:flex" : "flex"}>
          <ServersList />
        </div>

        {/* 2) ConversationsList */}
        <div className={channel ? "hidden sm:flex" : "flex"}>
          <ConversationsList />
        </div>

        {/* 3) Right-hand panel */}
        <div className={channel ? "flex-1" : "relative flex h-full w-full"}>
          {channel ? (
            <ChatWindow id={user.id} />
          ) : (
            <FriendList
              onClose={() => {
                setShowFriendsOverlay(false);
              }}
            />
          )}
        </div>
      </div>

      {/* FriendList Full-Screen Overlay */}
      {showFriendsOverlay && (
        <div className="fixed inset-0 z-30 bg-black/50 flex">
          <div className="m-auto w-full max-w-sm h-full bg-[#202225] p-4 overflow-y-auto">
            <button
              onClick={() => setShowFriendsOverlay(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <FriendList
              onClose={() => {
                setShowFriendsOverlay(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
