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
    <aside className="w-20 bg-[#111214] p-2 flex flex-col items-center space-y-2 shadow-lg">
      {serversInfo &&
        serversInfo.map((srv, i) => (
          <div
            key={i}
            className="h-12 w-12 bg-[#4f46e5] rounded-2xl flex items-center justify-center text-xs font-semibold text-white hover:bg-[#6366f1] transition"
            onClick={() => {
              navigate(`/home/servers/${srv.id}`);
            }}
          >
            {srv.name.charAt(0)}
          </div>
        ))}
      <div
        className="mt-2 border-1 border-gray-800 hover:bg-blue-600 rounded-md w-8 h-8 flex items-center justify-center"
        onClick={() => {
          setServerModal(true);
        }}
      >
        <img src={plusIcon} className="h-6 w-6" />
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
