import { useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";

const ApplicationSettings = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const onMount = async () => {
      if (!id) return;
      try {
        await axios.post(
          `http://localhost:3000/developer/applications/${id}/auth`,
          {},
          { withCredentials: true }
        );
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.log(error.response.data.message);
        } else {
          console.log("Network Error:", error);
        }
        navigate("/developer/applications");
      }
    };

    onMount();
  }, []);

  return <Outlet />;
};

export default ApplicationSettings;
