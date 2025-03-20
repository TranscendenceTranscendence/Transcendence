import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home.tsx";
import Login from "./pages/login/index";
import UpdateUser from "./pages/updateUser/updateUser.tsx";
import { Chat } from "./chat/Chat.tsx";
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

function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const navigate = useNavigate(); // Hook to navigate

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
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DevBarLayout />} />
          <Route path="/" element={<Home />} />
          <Route path="/update" element={<UpdateUser />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:id" element={<VisitingProfile />} />
          <Route path="/game" element={<Game />} />
          <Route path="/2fa/turn-on" element={<EnableTwoFactorAuth />} />
          <Route path="/2fa/turn-off" element={<DisableTwoFactorAuth />} />
          <Route path="/2fa/authenticate" element={<TwoFactorAuth />} />
          <Route path="/chat" element={<Chat />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Fragment>
  );
}

export default App;
