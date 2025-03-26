import { useState, useEffect } from "react";
import ChatRoomList from "./ChatRoomList.tsx";
import { ChatRoom } from "@/generated-api/index.ts";
import { useChatRooms, useAddParticipant } from "./ApiRequest.ts";
import { UserContextType } from "@/utils/providers/UserProvider.tsx";
// import { Dialog } from "@/components/ui/dialog.tsx";

interface ChatRoomContainerProps {
  userDetails: UserContextType;
  chatRoomId: number;
  setChatRoomId: (chatRoomId: number) => void;
}

export const ChatRoomContainer = ({
  userDetails,
  chatRoomId,
  setChatRoomId,
}: ChatRoomContainerProps) => {
  const [askPassword, setAskPassword] = useState<boolean>(false);
  const { chatRooms } = useChatRooms();
  let userId: number;

  useEffect(() => {
    if (chatRoomId !== null) {
      localStorage.setItem("chatRoomId", JSON.stringify(chatRoomId));
    }
  }, [chatRoomId]);

  useEffect(() => {
    console.log("askPassword state changed:", askPassword);
  }, [askPassword]);

  const { addParticipant } = useAddParticipant();

  const handleAddParticipant = async (userId: number, chatRoomId: number) => {
    console.log(
      "Participant is being added to the chatroom" + userId + chatRoomId,
    );
    await addParticipant(userId, chatRoomId);
  };

  const handleChatRoomChange = (newChatRoom: ChatRoom) => {
    console.log("handleChatRoomChange", newChatRoom);
    if (newChatRoom != null) {
      localStorage.setItem("chatRoomId", JSON.stringify(newChatRoom.id));
      setChatRoomId(newChatRoom?.id);
      console.log("addParticipant");
      handleAddParticipant(userDetails?.user.id, newChatRoom.id);
    } else console.log("Failed to change ChatRoom probably null!!");
    console.log("Chat room ID changed to:", newChatRoom?.id);
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
      {/* <ChatContainer chatRoomId={chatRoomId} userId={userId} />
      <PostChatRoom
        userId={userId}
        role={ChatParticipantChatParticipantRoleEnum.Owner}
      /> */}
    </div>
  );
};
