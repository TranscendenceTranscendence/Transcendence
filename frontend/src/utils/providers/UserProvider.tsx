import { type User, UserUserStatusEnum } from "@/generated-api";
import { useApi } from "@/utils/api";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

interface SubscribedToUser {
  id: number;
  status: UserUserStatusEnum | null;
}
export interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  subscribeToUser: (userId: number) => void;
  subscribedToUsersSet: SubscribedToUser[];
  socket: Socket | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [subscribedToUsersSet, setSubscribedToUsersSet] = useState<
    SubscribedToUser[]
  >([]);

  const navigate = useNavigate();
  const api = useApi();
  const socketRef = useRef<Socket | null>(null);
  const isSocketReady = useRef(false);
  const queuedUserIds = useRef(new Set<number>());

  const handleLogout = async () => {
    try {
      await api.Auth.authControllerLogout();
      localStorage.removeItem("access_token");
      socket?.disconnect();
      setSocket(null);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const waitForSocketReady = async () => {
    while (!socketRef.current || !isSocketReady.current) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  const subscribeToUser = async (userId: number) => {
    if (queuedUserIds.current.has(userId) || user?.id === userId) return;

    queuedUserIds.current.add(userId);
    await waitForSocketReady();

    if (!socketRef.current) return console.error("Socket not available!");
    if (subscribedToUsersSet.some((u) => u.id === userId)) return;

    socketRef.current.emit("subscribeToUser", userId);
    setSubscribedToUsersSet((prev) => [...prev, { id: userId, status: null }]);
  };

  useEffect(() => {
    if (loading) return;
    setLoading(true);
    api.Users.usersControllerMe()
      .then(setUser)
      .catch(() => setError("Failed to fetch user data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const socketConnection = io("wss://localhost:3000/users", {
      reconnectionAttempts: 5,
      transports: ["websocket"],
      auth: { token },
    });

    socketConnection.on("connect", () => {
      socketRef.current = socketConnection;
      isSocketReady.current = true;
      setSocket(socketConnection);
      setInterval(
        () => socketConnection.emit("heartbeat", { timestamp: Date.now() }),
        30000,
      );
    });

    socketConnection.on("userStatus", (data) => {
      setSubscribedToUsersSet((prev) =>
        prev.map((u) =>
          u.id === data.userId ? { ...u, status: data.status } : u,
        ),
      );
    });

    socketConnection.on("connect_error", (err) =>
      console.error("Socket connection error:", err),
    );

    return () => {
      if (user) return;
      socketConnection.disconnect();
      setSocket(null);
      socketRef.current = null;
      isSocketReady.current = false;
    };
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        subscribeToUser,
        logout: handleLogout,
        socket,
        subscribedToUsersSet,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
