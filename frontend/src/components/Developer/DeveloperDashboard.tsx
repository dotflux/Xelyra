import { useNavigate } from "react-router-dom";

const DeveloperDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Developer Portal</h1>
        <p className="text-gray-400 text-lg">
          Welcome to your developer workspace. Create applications, manage bots,
          and explore the SDK.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate("/developer/development/applications")}
          className="bg-[#1e1f22] rounded-xl p-6 border border-[#3a3b3e] hover:border-indigo-500/50 transition-colors text-left cursor-pointer hover:bg-[#2a2b2e]"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Applications</h3>
              <p className="text-sm text-gray-400">Manage your apps</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Create and manage your applications, configure bot settings, and
            monitor usage.
          </p>
          <div className="text-xs text-gray-500">
            Create applications, add bots, and configure settings
          </div>
        </button>

        <button
          onClick={() => navigate("/developer/development/documentation")}
          className="bg-[#1e1f22] rounded-xl p-6 border border-[#3a3b3e] hover:border-indigo-500/50 transition-colors text-left cursor-pointer hover:bg-[#2a2b2e]"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Documentation
              </h3>
              <p className="text-sm text-gray-400">Learn the SDK</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Explore comprehensive documentation, examples, and integration
            guides.
          </p>
          <div className="text-xs text-gray-500">
            API references, tutorials, and best practices
          </div>
        </button>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
