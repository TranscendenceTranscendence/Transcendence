import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login/index";
import UpdateUser from "./pages/updateUser/updateUser.tsx";
import { Chat } from "./chat/Chat.jsx";
import EnableTwoFactorAuth from "./pages/login/EnableTwoFactorAuth.tsx";
import DisableTwoFactorAuth from "./pages/login/DisableTwoFactorAuth";
import TwoFactorAuth from "./pages/login/TwoFactorAuth";
import Profile from "./pages/user/Profile";
import { useNavigate } from "react-router-dom";
import { Fragment, useEffect } from "react";
import { Toaster } from "./components/ui/sonner.tsx";

function App() {
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate(); // Hook to navigate

  if (params.has("access_token")) {
    localStorage.setItem("access_token", params.get("access_token"));
    params.delete("access_token");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${params.size > 0 ? `?${params}` : ""}`
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
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/update" element={<UpdateUser />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/2fa/turn-on" element={<EnableTwoFactorAuth />} />
        <Route path="/2fa/turn-off" element={<DisableTwoFactorAuth />} />
        <Route path="/2fa/authenticate" element={<TwoFactorAuth />} />
      </Routes>
    </Fragment>
  );
}

export default App;
