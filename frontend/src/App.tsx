import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/signup/Signup";
import SignupOtp from "./components/signup/SignupOtp";
import Login from "./components/login/Login";
import AuthenticatedLayout from "./components/Home/AuthenticatedLayout";
import Home from "./components/Home/Home";
import Index from "./Index";
import Server from "./components/Home/Servers/Server";
import Developer from "./components/Developer/Developer";
import ApplicationsList from "./components/Developer/ApplicationsList";
import ApplicationSettings from "./components/Developer/ApplicationSettings/ApplicationsSettings";
import AppOverview from "./components/Developer/ApplicationSettings/AppOverview";
import AppBot from "./components/Developer/ApplicationSettings/AppBot";
import DeveloperLanding from "./components/Developer/DeveloperLanding/DeveloperLanding";
import Documentation from "./components/Developer/Documentation";
import AppBotAdd from "./components/Developer/ApplicationSettings/AppBotAdd";
import DeveloperDashboard from "./components/Developer/DeveloperDashboard";
import ForgetPassword from "./components/ForgetPassword/ForgetPassword";
import ForgetPassOtp from "./components/ForgetPassword/ForgetPassOtp";

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
      path: "/forgetpassword",
      element: <ForgetPassword />,
    },
    {
      path: "/forgetpassword/otp",
      element: <ForgetPassOtp />,
    },
    {
      path: "/home",
      element: <AuthenticatedLayout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "servers/:id",
          element: <Server />,
        },
      ],
    },
    {
      path: "/developer",
      element: <DeveloperLanding />,
    },
    {
      path: "/developer/development",
      element: <Developer />,
      children: [
        {
          index: true,
          element: <DeveloperDashboard />,
        },
        {
          path: "applications",
          element: <ApplicationsList />,
        },
        {
          path: "documentation",
          element: <Documentation />,
        },
        {
          path: "applications/:id",
          element: <ApplicationSettings />,
          children: [
            {
              path: "overview",
              element: <AppOverview />,
            },
            {
              path: "bot",
              element: <AppBot />,
            },
            {
              path: "add",
              element: <AppBotAdd />,
            },
          ],
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
