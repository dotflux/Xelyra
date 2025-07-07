import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import HomeBG from "../Home/HomeBG";
import DevSidebar from "./DevSidebar";
import DeveloperTopBar from "./DeveloperTopBar";
import ApplicationsSidebar from "./ApplicationsSidebar";

interface User {
  id: string;
  username: string;
}

const Developer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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

  if (loading) return <>Loading...</>;
  if (!user) return null;
  return (
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
  );
};

export default Developer;
