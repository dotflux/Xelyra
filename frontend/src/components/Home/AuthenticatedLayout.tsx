import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { UserContext, type User } from "./UserContext";

const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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

  if (loading) return <>Loading...</>;
  if (!user) return null;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Outlet />
    </UserContext.Provider>
  );
};

export default AuthenticatedLayout;
