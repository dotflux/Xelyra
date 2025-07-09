import { useState } from "react";
import HomeBg from "./HomeBG";
import ServersList from "./ServersList";
import FriendList from "./FriendList";
import ConversationsList from "./ConversationsList";
import ChatWindow from "./Chat/ChatWindow";
import { useSearchParams } from "react-router-dom";
import { useUser } from "./UserContext";
import BelowBar from "./BelowBar";
import Xyn from "./Xyn";
import CreateServer from "./Servers/CreateServer";
import CreateCategory from "./Servers/CreateCategory";
import CreateChannel from "./Servers/CreateChannel";
import LoadingScreen from "./LoadingScreen";

const Home = () => {
  const [searchParams] = useSearchParams();
  const [showFriendsOverlay, setShowFriendsOverlay] = useState(false);
  const [serverModal, setServerModal] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState<null | string>(
    null
  );
  const channel = searchParams.get("channel");
  const { user } = useUser();

  if (!user) return <LoadingScreen />;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <HomeBg />
      {/* Main layout */}
      <div className="relative z-10 flex h-full">
        {/* 1) ServersList */}
        <div className={channel ? "hidden sm:flex" : "flex"}>
          <ServersList onOpenCreateServer={() => setServerModal(true)} />
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
            <>
              <FriendList
                onClose={() => {
                  setShowFriendsOverlay(false);
                }}
              />
              {/* Xyn side column */}
              <div className="hidden md:flex w-[420px] max-w-[40vw] border-l border-[#23232a] bg-[#18191c]">
                <Xyn />
              </div>
            </>
          )}
        </div>
      </div>

      {/* BelowBar: fixed at bottom left, always visible, never inside chat/friend list */}
      <div
        className={`fixed left-0 bottom-0 z-30 m-4 ${
          channel ? "hidden sm:block" : ""
        }`}
      >
        <BelowBar />
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
      {/* CreateServer Modal (global overlay) */}
      {serverModal && (
        <CreateServer
          isOpen={serverModal}
          onClose={() => setServerModal(false)}
        />
      )}
      {/* CreateCategory Modal (global overlay) */}
      {createCategoryOpen && (
        <CreateCategory
          isOpen={createCategoryOpen}
          onClose={() => setCreateCategoryOpen(false)}
        />
      )}
      {/* CreateChannel Modal (global overlay) */}
      {createChannelOpen && (
        <CreateChannel
          isOpen={true}
          onClose={() => setCreateChannelOpen(null)}
          categoryId={createChannelOpen}
        />
      )}
    </div>
  );
};

export default Home;
