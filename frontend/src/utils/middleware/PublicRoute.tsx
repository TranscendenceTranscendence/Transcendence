import { Navigate, Outlet } from "react-router-dom";
import getAuthData from "./isAuthenticated";

const PublicRoute: React.FC = () => {
  const { isAuthenticated } = getAuthData();
  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
