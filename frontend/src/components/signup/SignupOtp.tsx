import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import errorIcon from "../../assets/error.svg";
import axios from "axios";
import Loader from "./Loader";
import SignUpBG from "./SignupBG";

interface OtpData {
  otp: string;
}

const SignupOtp = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OtpData>();

  const delay = (d: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, d * 1000);
    });
  };

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
        setEmail(response.data.userEmail);
      } else {
        console.log("not valid");
      }
    } catch (error) {
      console.log("ballalalaa");
      navigate("/signup");
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };
  useEffect(() => {
    onMount();
  }, []);

  const maskEmail = (email: string) => {
    if (email.length < 2) {
      return "";
    }
    const [localPart, domain] = email.split("@");
    const visibleChars = localPart.slice(0, 2); // Show first 2 characters
    const maskedChars = "*".repeat(localPart.length - 2); // Replace the rest with asterisks
    return `${visibleChars}${maskedChars}@${domain}`;
  };

  const onSubmit: SubmitHandler<OtpData> = async (data: OtpData) => {
    try {
      const payload = {
        ...data,
        email,
      };
      await delay(5);
      const response = await axios.post(
        "http://localhost:3000/signup/otp",
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.valid) {
        navigate("/login");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
      } else {
        console.log("Network Error:", error);
      }
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen px-4 bg-black">
      <SignUpBG />
      <div className="relative w-full max-w-xl bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 p-8">
        {/* window controls */}
        <div className="flex space-x-2 mb-6">
          <span className="h-3 w-3 bg-red-500 rounded-full"></span>
          <span className="h-3 w-3 bg-green-500 rounded-full"></span>
          <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
        </div>

        <h2 className="text-2xl font-semibold text-white text-center mb-4">
          Verify Your Account
        </h2>
        <h3 className="text-sm font-light text-white text-start mt-4 mb-4">
          {`The otp was sent to ${maskEmail(email)}`}
        </h3>

        <form
          className="flex flex-col space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="text-white/80 block mb-1 text-sm">OTP</label>
            <input
              type="text"
              {...register("otp", {
                required: { value: true, message: "This field is required" },
              })}
              className="w-full p-3 bg-[#222] text-white border border-white/20 rounded-md focus:ring-2 focus:ring-white outline-none placeholder-white/40"
              placeholder="Enter your OTP"
            />
          </div>
          {error && (
            <div className="flex items-start space-x-2 mt-2">
              <img src={errorIcon} alt="Error" />
              <h3 className="text-red-500">{error}</h3>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 bg-white text-black rounded-md font-semibold transition-shadow hover:bg-gray-200 disabled:opacity-50`}
          >
            {isSubmitting ? <Loader /> : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupOtp;
