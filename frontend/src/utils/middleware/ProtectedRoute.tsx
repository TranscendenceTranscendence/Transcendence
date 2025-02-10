import { Navigate, Outlet } from "react-router-dom";
import getAuthData from "./isAuthenticated";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = getAuthData();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
