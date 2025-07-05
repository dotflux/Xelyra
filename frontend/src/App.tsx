import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/signup/Signup";
import SignupOtp from "./components/signup/SignupOtp";
import Login from "./components/login/Login";

function App() {
  const router = createBrowserRouter([
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/signup/otp",
      element: <SignupOtp />,
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
