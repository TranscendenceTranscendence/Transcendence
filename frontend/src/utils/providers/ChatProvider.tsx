import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useApi } from "@/utils/api";
import { ChatMessage, ChatParticipant } from "@/generated-api";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/utils/providers/UserProvider";
import { chat_participant_roles } from "../PostRequest";
import { UpdateParticipant } from "@/chat/ChatApiCalls";

interface ChatContextProps {
  chatRooms: {
    [key: number]: {
      messages: ChatMessage[];
      participants: ChatParticipant[];
    };
  };
  currentChatRoomId: number | null;
  sendMessage: (content: string) => void;
  joinChatRoom: (chatRoomId: number) => void;
  leaveChatRoom: () => void;
  deleteSession: (participant: ChatParticipant) => void;
}

const ChatContext = createContext<ChatContextProps | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useApi();
  const { user } = useUser();
  const [chatRooms, setChatRooms] = useState<ChatContextProps["chatRooms"]>({});
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !chatRoomId) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const socketConnection = io("wss://localhost:3000/chat", {
      transports: ["websocket"],
      auth: { token, roomId: chatRoomId }, // Include roomId in the auth payload
    });

    socketConnection.on("connect", () => {
      console.log(`Connected to chat WebSocket for room ${chatRoomId}`);
      socketRef.current = socketConnection;
    });

    // Handle incoming messages
    socketConnection.on("message", (data: ChatMessage) => {
      console.log("Received message:", data);
      setChatRooms((prev) => {
        const chatRoom = prev[data.chatRoomId] || {
          messages: [],
          participants: [],
        };
        return {
          ...prev,
          [data.chatRoomId]: {
            ...chatRoom,
            messages: [...chatRoom.messages, data],
          },
        };
      });
    });

    // Handle WebSocket connection errors
    socketConnection.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
    });

    return () => {
      // Leave the room and disconnect
      if (socketRef.current) {
        socketRef.current.emit("leaveRoom", { roomId: chatRoomId });
      }
      socketConnection.disconnect();
      socketRef.current = null;
    };
  }, [user, chatRoomId]);

  const joinChatRoom = async (newChatRoomId: number) => {
    if (chatRoomId === newChatRoomId) return;

    const { chatRooms } = await api.ChatRooms.chatRoomsControllerFindOne({
      id: newChatRoomId,
    });
    const { data: messages } =
      await api.ChatMessages.chatMessagesControllerFind({
        chatRoomId: newChatRoomId,
        blockedUsers: user?.blockedUsers,
      });
    const { chatParticipants } = chatRooms[0];

    setChatRooms((prev) => ({
      ...prev,
      [newChatRoomId]: {
        messages: messages,
        participants: chatParticipants,
      },
    }));

    if (socketRef.current) {
      socketRef.current.emit("joinRoom", { roomId: newChatRoomId });
    }

    setChatRoomId(newChatRoomId);

    console.log("Current", chatRoomId);
  };

  const leaveChatRoom = () => {
    if (socketRef.current && chatRoomId !== null) {
      socketRef.current.emit("leaveRoom", { roomId: chatRoomId });
    }
    setChatRoomId(null);
  };

  const sendMessage = async (content: string) => {
    if (chatRoomId === null || !socketRef.current || !user) return;

    try {
      // Create the message via the API
      const newMessage = await api.ChatMessages.chatMessagesControllerCreate({
        createChatMessageDto: {
          content,
          chatRoomId: chatRoomId,
        },
      });

      // Send the new message to the WebSocket
      socketRef.current.emit("message", newMessage);
    } catch (error) {
      if (error.response.status === 401) {
        console.error("participant is muted");
        return;
      } else console.error("Failed to send message:", error);
    }
  };

  const deleteSession = (participant: ChatParticipant) => {
    // console.log(participant.chatRoomId.toString());
    if (participant.chatParticipantRole === chat_participant_roles.Owner) {
      try {
        api.ChatRooms.chatRoomsControllerRemove({
          id: participant.chatRoomId.toString(),
        });
        // console.log("Chat room deleted", result);
      } catch (error) {
        // console.error("Failed to delete chat room:", error);
      }
    } else {
      try {
        UpdateParticipant(participant.chatRoomId, participant.userId);
        console.log("Participant leftAt is updated");
      } catch (error) {
        // console.error("Failed to update leftAt participant:", error);
      }
    }
    leaveChatRoom();
  };
  return (
    <ChatContext.Provider
      value={{
        chatRooms,
        sendMessage,
        joinChatRoom,
        leaveChatRoom,
        deleteSession,

        currentChatRoomId: chatRoomId,
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
