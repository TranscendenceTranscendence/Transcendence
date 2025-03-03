import { MeResponseSuccess } from "@/generated-api";
import { useApi } from "@/utils/api";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

export interface UserContextType {
  user: MeResponseSuccess | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  socket: Socket | null;
}

export const userContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  logout: () => {
    console.error("no implementation provided for logout");
  },
  socket: null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MeResponseSuccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();
  const api = useApi();

  const handleLogout = async () => {
    try {
      await api.Auth.authControllerLogout();
      // Clear local storage
      localStorage.removeItem("access_token");
      // localStorage.removeItem('refreshToken'); // If you have a refresh token

      // Disconnect socket if exists
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    (async () => {
      console.log("fetching user data");
      if (loading) return;
      setLoading(true);
      try {
        const response = await api.Users.usersControllerMe();
        setUser(response);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setError("Failed to fetch user data");
      }
      setLoading(false);
    })();
  }, []);

  // Establish the WebSocket connection when the user is authenticated.
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No token found for WebSocket connection");
        return;
      }

      let heartbeatInterval: NodeJS.Timeout | null = null;

      // Connect to your WebSocket server (update the URL as needed)
      const socketConnection = io("wss://localhost:3000/users", {
        reconnectionAttempts: 5,
        transports: ["websocket"], // Force WebSocket transport
        auth: { token },
      });

      socketConnection.on("connect", () => {
        console.log("Socket connected:", socketConnection.id);
        // Start heartbeat interval (emit every 30 seconds)
        heartbeatInterval = setInterval(() => {
          socketConnection.emit("heartbeat", { timestamp: Date.now() });
        }, 30000);
      });

      socketConnection.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      setSocket(socketConnection);

      // Clean up on unmount or when the user changes
      return () => {
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        socketConnection.disconnect();
        setSocket(null);
      };
    }
  }, [user]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <userContext.Provider
      value={{ user, loading, error, logout: handleLogout, socket }}
    >
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(userContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
