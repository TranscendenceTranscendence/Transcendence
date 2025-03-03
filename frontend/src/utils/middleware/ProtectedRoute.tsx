import { Navigate, Outlet, useLocation } from "react-router-dom";
import getAuthData from "./isAuthenticated";
import { UserProvider } from "../providers/UserProvider";

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, needsTwoFactorAuthentication } = getAuthData();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (
    needsTwoFactorAuthentication &&
    location.pathname !== "/2fa/authenticate"
  ) {
    return <Navigate to="/2fa/authenticate" />;
  }

  if (
    !needsTwoFactorAuthentication &&
    location.pathname === "/2fa/authenticate"
  ) {
    return <Navigate to="/" />;
  }

  return (
    <UserProvider>
      <Outlet />
    </UserProvider>
  );
};

export default ProtectedRoute;
