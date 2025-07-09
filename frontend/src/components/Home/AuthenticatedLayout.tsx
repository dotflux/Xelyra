import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { UserContext, type User } from "./UserContext";
import { io, Socket } from "socket.io-client";
import LoadingScreen from "./LoadingScreen";

const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.post(
          "http://localhost:3000/home/auth",
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

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Outlet />
    </UserContext.Provider>
  );
};

export default AuthenticatedLayout;
