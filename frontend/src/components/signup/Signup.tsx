import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SignupBG from "./SignupBG";
import SignupDetails from "./SignupDetails";

const Signup = () => {
  const navigate = useNavigate();
  const onMount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/signup/auth",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        navigate("/signup/otp");
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
      <SignupBG />
      <SignupDetails />
    </div>
  );
};

export default Signup;
