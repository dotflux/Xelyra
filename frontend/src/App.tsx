import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/signup/Signup";
import SignupOtp from "./components/signup/SignupOtp";
import Login from "./components/login/Login";
import AuthenticatedLayout from "./components/Home/AuthenticatedLayout";
import Home from "./components/Home/Home";
import Index from "./Index";

function App() {
  const router = createBrowserRouter([
    {
      index: true,
      element: <Index />,
    },
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
    {
      path: "/home",
      element: <AuthenticatedLayout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
