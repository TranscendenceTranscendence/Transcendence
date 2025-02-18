import { MeResponseSuccess, User } from "@/generated-api";
import { useApi } from "@/utils/api";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const userContext = createContext({
  user: null as MeResponseSuccess | null,
  loading: true,
  error: null as string | null,
  logout: () => {
    console.error("no implementation provided for logout");
  },
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MeResponseSuccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const api = useApi();

  const handleLogout = async () => {
    try {
      await api.Auth.authControllerLogout();
      // Clear local storage
      localStorage.removeItem("access_token");
      // localStorage.removeItem('refreshToken'); // If you have a refresh token

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    (async () => {
      if (!loading) return;
      setLoading(true);
      try {
        const response = await api.Users.usersControllerMe();
        setUser(response);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setError("Failed to fetch user data");
      }
    })();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <userContext.Provider
      value={{ user, loading, error, logout: handleLogout }}
    >
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(userContext);
  if (context === undefined)
    throw new Error("useUser must be used within a UserProvider");
  return context;
};
