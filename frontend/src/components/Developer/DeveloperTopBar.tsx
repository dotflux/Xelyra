interface User {
  username: string;
  id: string;
  pfp?: string;
  displayName?: string;
}

interface Props {
  user: User;
}

const DeveloperTopBar = (props: Props) => {
  const displayName = props.user.displayName || props.user.username;
  return (
    <header
      className="h-14 bg-[#141516] border-b border-gray-300/50 px-6 flex items-center justify-between shadow-sm"
      style={{ borderBottomWidth: "0.1px" }}
    >
      {/* Left side: page title or breadcrumbs */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-white">Developer Portal</h1>
      </div>

      {/* Right side: action button + user info */}
      <div className="flex items-center space-x-4">
        {props.user && (
          <div className="flex items-center space-x-2">
            {props.user.pfp ? (
              <img
                src={
                  props.user.pfp.startsWith("/uploads/")
                    ? `http://localhost:3000${props.user.pfp}`
                    : props.user.pfp
                }
                alt="User PFP"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-medium">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-white">{displayName}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default DeveloperTopBar;
