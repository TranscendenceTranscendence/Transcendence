import { useState } from "react";
import ChatRoomList from "./ChatRoomList.tsx";
import { ChatRoom } from "@/generated-api/index.ts";
import { useChatRooms, useAddParticipant } from "./ApiRequest.ts";
import { useUser } from "@/utils/providers/UserProvider.tsx";
import { useChat } from "@/utils/providers/ChatProvider.tsx";
// import { Dialog } from "@/components/ui/dialog.tsx";

export const ChatRoomContainer = () => {
  const [askPassword, setAskPassword] = useState<boolean>(false);
  const { chatRooms } = useChatRooms();
  const { joinChatRoom } = useChat();
  const me = useUser();
  let userId: number;

  const { addParticipant } = useAddParticipant();

  const handleAddParticipant = async (userId: number, chatRoomId: number) => {
    await addParticipant(userId, chatRoomId);
  };

  const handleChatRoomChange = (newChatRoom: ChatRoom) => {
    if (newChatRoom != null) {
      localStorage.setItem("chatRoomId", JSON.stringify(newChatRoom.id));
      handleAddParticipant(me?.user.id, newChatRoom.id);
      joinChatRoom(newChatRoom.id);
    }
  };
  console.log("chatRoomContaner", userId);
  return (
    <div className="chatRoomBox">
      <ChatRoomList
        chatRooms={chatRooms}
        // particpants={chatRooms.chatRooms.}
        userId={me.user.id}
        onChatRoomChange={handleChatRoomChange}
        askPassword={askPassword}
        setAskPassword={setAskPassword}
      />
    </div>
  );
};
