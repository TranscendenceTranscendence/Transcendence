import {useState, useEffect } from "react";
import { PostChatRoom } from "./PostChatRoom.tsx";
import  ChatRoomList from "./ChatRoomList.tsx";
import ChatContainer from "../chat/ChatContainer.tsx";
import { MeResponseSuccess, ChatRoom, ChatParticipantChatParticipantRoleEnum  } from '@/generated-api/index.ts';
import { useChatRooms, UseaddParticipant } from "./ApiRequest.tsx";

interface ChatRoomContainerProps {
  userDetails: MeResponseSuccess;
}

export const ChatRoomContainer = ({ userDetails }: ChatRoomContainerProps) => {
  const [askPassword, setAskPassword] = useState<boolean>(false);
  const { chatRooms } = useChatRooms();

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
      "Participant is being added to the chatroom" + userId + chatRoomId
    );
    UseaddParticipant(userId, chatRoomId);
  };

  const handleChatRoomChange = (newChatRoom: ChatRoom) => {
    console.log("handleChatRoomChange", newChatRoom);
    if (newChatRoom != null)
    {
      localStorage.setItem("chatRoomId", JSON.stringify(newChatRoom.id));
      setChatRoomId(newChatRoom?.id);
      console.log("addParticipant");
      addParticipant(userDetails.id, newChatRoom.id);
    }
    else 
      console.log("Failed to change ChatRoom probably null!!");
    console.log("Chat room ID changed to:", newChatRoom?.id);
  };
  return (
    <div className="chatRoomBox">
      <ChatRoomList
        chatRooms={chatRooms}
        userId={userDetails.id}
        onChatRoomChange={handleChatRoomChange}
        askPassword={askPassword}
        setAskPassword={setAskPassword}
      />
      <ChatContainer chatRoomId={chatRoomId} userId={userDetails.id} />
      <PostChatRoom
        userId={userDetails.id}
        role={ChatParticipantChatParticipantRoleEnum.Owner}
      />
    </div>
  );
};
