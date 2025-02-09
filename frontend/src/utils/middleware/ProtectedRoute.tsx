import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("access_token");
  return !!token; // Ensures token exists
};

const ProtectedRoute: React.FC = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
