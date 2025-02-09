import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("access_token");
  return !!token;
};

const PublicRoute: React.FC = () => {
  return isAuthenticated() ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
