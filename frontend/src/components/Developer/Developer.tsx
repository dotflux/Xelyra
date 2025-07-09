import { useState, useEffect, useRef, createContext } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import HomeBG from "../Home/HomeBG";
import DevSidebar from "./DevSidebar";
import DeveloperTopBar from "./DeveloperTopBar";
import ApplicationsSidebar from "./ApplicationsSidebar";
import { io, Socket } from "socket.io-client";
import ApplicationsList from "./ApplicationsList";

interface User {
  id: string;
  username: string;
  displayName?: string;
  pfp?: string;
}

export const UserContext = createContext<User | null>(null);

const Developer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const { id } = useParams();

  const isAppView = location.pathname.startsWith(
    `/developer/development/applications/${id}`
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.post(
          "http://localhost:3000/developer/auth",
          {},
          { withCredentials: true }
        );
        if (res.data.valid) {
          setUser(res.data.userData);
        } else {
          navigate("/login");
        }
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    socketRef.current = io("http://localhost:3000/messages", {
      withCredentials: true,
    });
    socketRef.current.emit("joinUser", user.id);
    socketRef.current.on(
      "userUpdated",
      (data: { userId: string; userData: User }) => {
        if (data.userId === user.id) {
          setUser((prev) => ({ ...prev, ...data.userData }));
        }
      }
    );
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  if (loading) return <>Loading...</>;
  if (!user) return null;
  return (
    <UserContext.Provider value={user}>
      <div className="relative flex h-screen">
        <HomeBG />

        <div className="relative flex flex-1 flex-col overflow-hidden">
          <DeveloperTopBar user={user} />
          <div className="flex-1 flex overflow-hidden">
            {isAppView && id ? <ApplicationsSidebar /> : <DevSidebar />}
            <div className="flex-1 p-6 overflow-auto min-h-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </UserContext.Provider>
  );
};

export default Developer;
