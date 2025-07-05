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
          className="sm:hidden fixed bottom-6 right-6 z-20 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 hover:shadow-indigo-500/25"
          title="Open Friends"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
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
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex">
          <div className="m-auto w-full max-w-sm h-full bg-[#202225] p-6 overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowFriendsOverlay(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
