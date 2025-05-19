import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home.tsx";
import Login from "./pages/login/index";
import UpdateUser from "./pages/updateUser/updateUser.tsx";
import EnableTwoFactorAuth from "./pages/login/EnableTwoFactorAuth.tsx";
import DisableTwoFactorAuth from "./pages/login/DisableTwoFactorAuth";
import TwoFactorAuth from "./pages/login/TwoFactorAuth";
import { useNavigate } from "react-router-dom";
import { Fragment, useEffect, useMemo } from "react";
import { Toaster } from "./components/ui/sonner.tsx";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/middleware/ProtectedRoute.tsx";
import PublicRoute from "./utils/middleware/PublicRoute.tsx";
import UserProfile from "./pages/profile/UserProfile.tsx";
import VisitingProfile from "./pages/profile/VisitingProfile.tsx";
import { DevBarLayout } from "@/utils/layouts/DevBarLayout.tsx";
import Game from "./pages/game/Game.tsx";
import Result from "./pages/result/result.tsx";
import { useApi } from "@/utils/api";
import Statistics from "./pages/statistics/Statistics.tsx";
import Queue from "./pages/queue/Queue.tsx";
import Invite from "./pages/invite/Invite.tsx";

function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const navigate = useNavigate(); // Hook to navigate
  const api = useApi(); // Use your API utility to make backend requests

  // Function to validate and remove invalid access_token
  async function validateAccessToken() {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return; // No token to validate

    api.Users.usersControllerMe()
      .then(() => {
        console.log("Valid access_token! :)");
      })
      .catch((error) => {
        // console.error("Error validating access_token:", error);
        console.log("Not a valid access_token! :(");
        localStorage.removeItem("access_token"); // Remove access token if validation fails.
        navigate("/login"); // Redirect to login page
      });
  }

  useEffect(() => {
    // Validate the access_token when the app initializes
    validateAccessToken();
  }, []);

  if (params.has("access_token")) {
    localStorage.setItem("access_token", params.get("access_token"));
    params.delete("access_token");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${params.size > 0 ? `?${params}` : ""}`,
    );
  }

  useEffect(() => {
    if (params.has("redirect")) {
      navigate(params.get("redirect"));
    }
  }, [params, navigate]);

  return (
    <Fragment>
      <Toaster />

      <Routes>
        {/* Public Routes */}
        {/* <Route element={<DevBarLayout />}> */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/update" element={<UpdateUser />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:id" element={<VisitingProfile />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/game" element={<Game />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/result" element={<Result />} />
          <Route path="/invite" element={<Invite />} />
          <Route path="/2fa/turn-on" element={<EnableTwoFactorAuth />} />
          <Route path="/2fa/turn-off" element={<DisableTwoFactorAuth />} />
          <Route path="/2fa/authenticate" element={<TwoFactorAuth />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
        {/* </Route> */}
      </Routes>
    </Fragment>
  );
}

export default App;
