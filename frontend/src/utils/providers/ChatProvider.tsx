import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useApi } from "@/utils/api";
import { ChatMessage, ChatParticipant } from "@/generated-api";
import { useUser } from "@/utils/providers/UserProvider";

interface ChatContextProps {
  chatRooms: {
    [key: number]: {
      messages: ChatMessage[];
      participants: ChatParticipant[];
    };
  };
  participants: ChatParticipant[];
  sendMessage: (content: string) => void;
  joinChatRoom: (chatRoomId: number) => void;
  leaveChatRoom: () => void;
}

const ChatContext = createContext<ChatContextProps | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const api = useApi();
  const [chatRooms, setChatRooms] = useState<ChatContextProps["chatRooms"]>({});
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const currentChatRoom = chatRooms[chatRoomId || 0] || [];
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !currentChatRoom) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const socket = io("wss://localhost:3000/chat", {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Connected to chat socket");
      socket.emit("joinRoom", { chatRoomId });
    });

    socket.on("message", (message: ChatMessage) => {
      setChatRooms((prev) => ({
        ...prev,
        [message.chatRoomId]: {
          messages: [...prev[message.chatRoomId].messages, message],
          participants: prev[message.chatRoomId].participants,
        },
      }));
    });

    socket.on("participants", (updatedParticipants: ChatParticipant[]) => {
      setChatRooms((prev) => ({
        ...prev,
        [chatRoomId || 0]: {
          messages: prev[chatRoomId || 0].messages,
          participants: updatedParticipants,
        },
      }));
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, currentChatRoom]);

  const sendMessage = (content: string) => {
    if (!socketRef.current || !chatRoomId || !user) return;

    const message: ChatMessage = {
      id: Date.now(), // Replace with a proper unique ID if available
      content,
      chatRoomId: chatRoomId,
      sentTime: new Date(), // Replace with the actual sent time if available
      user: user,
      userId: 0,
      chatRoom: null,
    };
    socketRef.current.emit("sendMessage", message);
    setMessages((prev) => [...prev, message]);
  };

  const joinChatRoom = async (newChatRoomId: number) => {
    if (chatRoomId === newChatRoomId) return;

    if (socketRef.current) {
      socketRef.current.emit("leaveRoom", { chatRoomId });
    }

    setChatRoomId(newChatRoomId);

    try {
      const response =
        await api.ChatParticipants.chatParticipantsControllerFindParticipantByChatRoom(
          {
            chatRoomId: newChatRoomId,
          },
        );
      if (response.success) {
        setChatRooms((prev) => ({
          ...prev,
          [newChatRoomId]: {
            messages: prev[newChatRoomId]?.messages || [],
            participants: response.chatParticipants,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }

    try {
      const response = await api.ChatMessages.chatMessagesControllerFindOne({
        id: newChatRoomId.toString(),
      });
      if (response.success) {
        setChatRooms((prev) => ({
          ...prev,
          [newChatRoomId]: {
            messages: response.data,
            participants: prev[newChatRoomId]?.participants || [],
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const leaveChatRoom = () => {
    if (socketRef.current && chatRoomId) {
      socketRef.current.emit("leaveRoom", { chatRoomId });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chatRooms: { [chatRoomId || 0]: messages },
        participants,
        sendMessage,
        joinChatRoom,
        leaveChatRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
