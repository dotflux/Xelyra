import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import plusIcon from "../../assets/plus.svg";
import CreateServer from "./Servers/CreateServer";

interface ServerInfo {
  name: string;
  id: string;
}

const ServersList = () => {
  const [serversInfo, setServers] = useState<ServerInfo[] | null>(null);
  const navigate = useNavigate();
  const [serverModal, setServerModal] = useState(false);

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
    <aside className="w-20 bg-[#111214] p-3 flex flex-col items-center space-y-3 shadow-2xl border-r border-gray-700/50">
      {serversInfo &&
        serversInfo.map((srv, i) => (
          <div
            key={i}
            className="h-12 w-12 bg-[#4f46e5] rounded-2xl flex items-center justify-center text-xs font-bold text-white hover:bg-[#6366f1] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/25"
            onClick={() => {
              navigate(`/home/servers/${srv.id}`);
            }}
          >
            <span className="truncate max-w-full px-1 text-center">
              {srv.name}
            </span>
          </div>
        ))}
      <div
        className="mt-2 border-2 border-dashed border-gray-600 hover:border-indigo-500 hover:bg-indigo-500/10 rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
        onClick={() => {
          setServerModal(true);
        }}
      >
        <img
          src={plusIcon}
          className="h-5 w-5 opacity-60 hover:opacity-100 transition-opacity"
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
