import { useState, useEffect } from "react";
import ChatRoomList from "./ChatRoomList.tsx";
import { ChatRoom } from "@/generated-api/index.ts";
import { useChatRooms, useAddParticipant } from "./ApiRequest.ts";
import { UserContextType } from "@/utils/providers/UserProvider.tsx";
import { useChat } from "@/utils/providers/ChatProvider.tsx";
// import { Dialog } from "@/components/ui/dialog.tsx";

interface ChatRoomContainerProps {
  userDetails: UserContextType;
}

export const ChatRoomContainer = ({ userDetails }: ChatRoomContainerProps) => {
  const [askPassword, setAskPassword] = useState<boolean>(false);
  const { chatRooms } = useChatRooms();
  const { joinChatRoom } = useChat();
  let userId: number;

  const { addParticipant } = useAddParticipant();

  const handleAddParticipant = async (userId: number, chatRoomId: number) => {
    await addParticipant(userId, chatRoomId);
  };

  const handleChatRoomChange = (newChatRoom: ChatRoom) => {
    if (newChatRoom != null) {
      localStorage.setItem("chatRoomId", JSON.stringify(newChatRoom.id));
      handleAddParticipant(userDetails?.user.id, newChatRoom.id);
      joinChatRoom(newChatRoom.id);
    }
  };
  if (userDetails == null || userDetails.user == null) {
    console.log("ChatRoomContainer userDetails is null");
    userId = -1;
  } else {
    console.log("ChatRoomContainer userDetails:", userDetails.user.id);
    userId = userDetails.user.id;
  }
  return (
    <div className="chatRoomBox">
      <ChatRoomList
        chatRooms={chatRooms}
        userId={userId}
        onChatRoomChange={handleChatRoomChange}
        askPassword={askPassword}
        setAskPassword={setAskPassword}
      />
    </div>
  );
};
