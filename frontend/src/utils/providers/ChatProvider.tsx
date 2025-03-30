import React, { createContext, useContext, useState } from "react";
import { useApi } from "@/utils/api";
import { ChatMessage, ChatParticipant } from "@/generated-api";
import Chat from "@/components/chat/chat";

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
}

const ChatContext = createContext<ChatContextProps | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useApi();
  const [chatRooms, setChatRooms] = useState<ChatContextProps["chatRooms"]>({});
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);

  const joinChatRoom = async (newChatRoomId: number) => {
    if (chatRoomId === newChatRoomId) return;
    setChatRoomId(newChatRoomId);
    if (!chatRooms[newChatRoomId]) {
      const { chatRooms } = await api.ChatRooms.chatRoomsControllerFindOne({
        id: newChatRoomId,
      });
      const { data: messages } =
        await api.ChatMessages.chatMessagesControllerFind({
          findChatMessageDto: {
            chatRoomId: newChatRoomId,
          },
        });
      const { chatParticipants } = chatRooms[0];
      setChatRooms((prev) => ({
        ...prev,
        [newChatRoomId]: {
          messages: messages,
          participants: chatParticipants,
        },
      }));
    }
  };

  const leaveChatRoom = () => {
    setChatRoomId(null);
  };

  const sendMessage = (content: string) => {
    // Placeholder for sending a message logic
    console.log("Message sent:", content);
  };

  return (
    <ChatContext.Provider
      value={{
        chatRooms,
        sendMessage,
        joinChatRoom,
        leaveChatRoom,
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
