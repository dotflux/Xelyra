import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SignUpBG from "../signup/SignupBG";
import LoginDetails from "./LoginDetails";

const Login = () => {
  const navigate = useNavigate();
  const onMount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/login/auth",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        navigate("/home");
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
    <div>
      <SignUpBG />
      <LoginDetails />
    </div>
  );
};

export default Login;
