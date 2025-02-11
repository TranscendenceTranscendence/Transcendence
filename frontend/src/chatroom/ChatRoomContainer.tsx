import React, { useState, useEffect } from "react";
import { PostChatRoom } from "../utils/PostRequest.tsx";
import  ChatRoomList from "./ChatRoomList.tsx";
import ChatContainer from "../chat/ChatContainer.tsx";
import { handleSubmitParticipant } from "../utils/PostRequest.tsx";
import { MeResponseSuccess } from '@/generated-api/index.ts';
import { useFetchRequest } from "../utils/FetchRequest.tsx";
import { JoinPrivate } from "./JoinPrivate.tsx";
import { useApi } from "@/utils/api/index.ts";

enum chat_room_types {
  Public = "public",
  Protected = "protected",
  Private = "private",
}

interface Participant {
  user_id: number;
}

interface ChatRoom {
  title: string;
  id: number;
  chat_room_type: chat_room_types;
  password: string;
  chatParticipants: Participant[];
}

enum chat_participant_roles {
  Owner = "owner",
  Admin = "admin",
  Guest = "guest",
}

interface ChatRoomContainerProps {
  userDetails: MeResponseSuccess;
}

export const ChatRoomContainer = ({ userDetails }: ChatRoomContainerProps) => {
  const api = useApi();
  const [askPassword, setAskPassword] = useState<boolean>(false);
  const { data: chatRooms } = api.ChatRooms.chatRoomsControllerFindAllincludeParticipant();
  // const url = "https://localhost:3000/chatroom/includeParticipant";
  // const { data: chatRooms } = useFetchRequest<ChatRoom[]>(url);
  const [chatRoomId, setChatRoomId] = useState(() => {
    try {
      const savedId = localStorage.getItem("chatRoomId");
      return savedId ? JSON.parse(savedId) : 1;
    } catch (error) {
      console.error("Failed to parse chatRoomId from localStorage:", error);
      return 1;
    }
  });
  useEffect(() => {
    if (chatRoomId !== null) {
      localStorage.setItem("chatRoomId", JSON.stringify(chatRoomId));
    }
  }, [chatRoomId]);

  useEffect(() => {
    console.log("askPassword state changed:", askPassword);
  }, [askPassword]);

  const addParticipant = async (userId: number, chatRoomId: number) => {
    console.log(
      "participant wordt geadded aan de chatRoom" + userId + chatRoomId
    );
    await handleSubmitParticipant(
      `https://localhost:3000/chatParticipants/${chatRoomId}/join/${userId}`,
      userId,
      chatRoomId
    );
  };

  const handleChatRoomChange = (newChatRoom: ChatRoom) => {
    console.log("handleChatRoomChange", newChatRoom);
    if (newChatRoom != null) {
      localStorage.setItem("chatRoomId", JSON.stringify(newChatRoom.id));
      setChatRoomId(newChatRoom?.id);
      console.log("addParticipant");
      addParticipant(userDetails.id, newChatRoom.id);
    } else console.log("Failed to change ChatRoom probably null!!");
    console.log("Chat room ID changed to:", newChatRoom?.id);
  };
  console.log("chatRooms", chatRooms);
  return (
    <div className="chatRoomBox">
      <ChatRoomList
        chatRooms={chatRooms ?? []}
        chatRoomId={chatRoomId}
        userId={userDetails.id}
        onChatRoomChange={handleChatRoomChange}
        askPassword={askPassword}
        setAskPassword={setAskPassword}
      />
      <ChatContainer chatRoomId={chatRoomId} userId={userDetails.id} />
      <JoinPrivate onChatRoomChange={handleChatRoomChange} />
      <PostChatRoom
        url={"https://localhost:3000/chatroom"}
        userId={userDetails.id}
        role={chat_participant_roles.Owner}
      />
    </div>
  );
};
