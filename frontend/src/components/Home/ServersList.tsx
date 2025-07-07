import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import plusIcon from "../../assets/plus.svg";
import CreateServer from "./Servers/CreateServer";

interface ServerInfo {
  name: string;
  id: string;
}

const getColorFromName = (name: string) => {
  // Simple hash to color
  const colors = [
    "bg-indigo-600",
    "bg-purple-600",
    "bg-pink-600",
    "bg-blue-600",
    "bg-green-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const ServersList = () => {
  const [serversInfo, setServers] = useState<ServerInfo[] | null>(null);
  const navigate = useNavigate();
  const [serverModal, setServerModal] = useState(false);
  const location = useLocation();
  const activeServerId = location.pathname.match(/servers\/(\w+)/)?.[1];

  const onMount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/home/servers",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        setServers(response.data.serverData);
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
  }, []);

  return (
    <aside className="w-20 bg-gradient-to-b from-[#181a20] via-[#16171a] to-[#131417] p-4 flex flex-col items-center space-y-4 shadow-2xl border-r border-gray-700/50 backdrop-blur-md">
      {serversInfo &&
        serversInfo.map((srv, i) => (
          <div
            key={i}
            className={`relative group h-12 w-12 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 shadow-lg border-2
              ${
                activeServerId === srv.id
                  ? "bg-blue-600 ring-2 ring-blue-300 scale-110 shadow-blue-500/40"
                  : "bg-gray-800 hover:scale-110 hover:ring-2 hover:ring-gray-400"
              }
            `}
            onClick={() => {
              navigate(`/home/servers/${srv.id}`);
            }}
            title={srv.name}
          >
            <span className="text-lg font-extrabold text-white select-none">
              {srv.name.charAt(0).toUpperCase()}
            </span>
            {/* Tooltip */}
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#23232a] text-white text-xs font-semibold px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {srv.name}
            </span>
          </div>
        ))}
      <div
        className="mt-2 w-11 h-11 flex items-center justify-center rounded-full border-2 border-dashed border-gray-600 hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer transition-all duration-200 hover:scale-125 group"
        onClick={() => {
          setServerModal(true);
        }}
      >
        <img
          src={plusIcon}
          className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-90 duration-300"
        />
      </div>
      {serverModal && (
        <CreateServer
          isOpen={serverModal}
          onClose={() => {
            setServerModal(false);
          }}
        />
      )}
    </aside>
  );
};

export default ServersList;
