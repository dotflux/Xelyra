import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import plusIcon from "../../assets/plus.svg";
import xelyraIcon from "../../../public/xelyra-icon.png";

interface ServerInfo {
  name: string;
  id: string;
  pfp?: string;
}

interface Props {
  onOpenCreateServer: () => void;
}

const ServersList = ({ onOpenCreateServer }: Props) => {
  const [serversInfo, setServers] = useState<ServerInfo[] | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const activeServerId = location.pathname.match(/servers\/(\w+)/)?.[1];
  const isHome = location.pathname === "/home";

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
      {/* Xelyra Home (DMs) Button */}
      <div
        className={`mb-2 h-12 w-12 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 shadow-lg border-2
          ${
            isHome
              ? "bg-indigo-700 ring-2 ring-indigo-400 scale-110 shadow-indigo-500/40"
              : "bg-black hover:scale-110 hover:ring-2 hover:ring-indigo-400"
          }`}
        onClick={() => navigate("/home")}
        title="Direct Messages"
      >
        <img src={xelyraIcon} alt="Xelyra" className="h-7 w-7" />
      </div>
      {/* Separator */}
      <div className="w-10 h-0.5 rounded bg-gradient-to-r from-[#16171a] via-gray-700/40 to-[#16171a] opacity-70 my-3" />
      {serversInfo &&
        serversInfo.map((srv, i) => (
          <div
            key={i}
            className={`relative group h-12 w-12 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 shadow-lg border-2
              ${
                activeServerId === srv.id
                  ? "bg-blue-600 ring-4 ring-blue-400 scale-110 shadow-blue-500/60 border-white"
                  : "bg-gray-800 hover:scale-110 hover:ring-2 hover:ring-gray-400"
              }
            `}
            onClick={() => {
              navigate(`/home/servers/${srv.id}`);
            }}
            title={srv.name}
          >
            {srv.pfp ? (
              <img
                src={srv.pfp}
                alt={srv.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-700 shadow"
              />
            ) : (
              <span className="text-lg font-extrabold text-white select-none">
                {srv.name.charAt(0).toUpperCase()}
              </span>
            )}
            {/* Tooltip */}
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#23232a] text-white text-xs font-semibold px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {srv.name}
            </span>
          </div>
        ))}
      <div
        className="mt-2 w-11 h-11 flex items-center justify-center rounded-full border-2 border-dashed border-gray-600 hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer transition-all duration-200 hover:scale-125 group"
        onClick={onOpenCreateServer}
      >
        <img
          src={plusIcon}
          className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-90 duration-300"
        />
      </div>
    </aside>
  );
};

export default ServersList;
