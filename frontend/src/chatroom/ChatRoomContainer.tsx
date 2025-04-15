import { useState } from "react";
import ChatRoomList from "./ChatRoomList.tsx";
import { ChatRoom } from "@/generated-api/index.ts";
import { useChatRooms, useAddParticipant } from "./ApiRequest.ts";
import { useUser } from "@/utils/providers/UserProvider.tsx";
import { useChat } from "@/utils/providers/ChatProvider.tsx";

export const ChatRoomContainer = () => {
  const [askPassword, setAskPassword] = useState<boolean>(false);
  const { chatRooms } = useChatRooms();
  const { joinChatRoom } = useChat();
  const me = useUser();
  const userId = me?.user?.id;
  const { addParticipant } = useAddParticipant();

  const handleAddParticipant = async (userId: number, chatRoomId: number) => {
    if (!userId || !chatRoomId) {
      console.error("Invalid userId or chatRoomId");
      return;
    }
    await addParticipant(userId, chatRoomId);
  };

  const handleChatRoomChange = (newChatRoom: ChatRoom) => {
    if (!newChatRoom || !userId) {
      console.error("Invalid chat room or user");
      return;
    }
    localStorage.setItem("chatRoomId", JSON.stringify(newChatRoom.id));
    handleAddParticipant(userId, newChatRoom.id);
    joinChatRoom(newChatRoom.id);
  };

  return (
    <div className="chatRoomBox">
      <ChatRoomList
        chatRooms={chatRooms}
        userId={userId || 0} // Provide a fallback value
        onChatRoomChange={handleChatRoomChange}
        askPassword={askPassword}
        setAskPassword={setAskPassword}
      />
    </div>
  );
};
