import { useState } from "react";
import ChatRoomList from "./ChatRoomList.tsx";
import { ChatRoom } from "@/generated-api/index.ts";
import { useChatRoomsList, useAddParticipant } from "./ApiRequest.ts";
import { useUser } from "@/utils/providers/UserProvider.tsx";
import { useChat } from "@/utils/providers/ChatProvider.tsx";
import { Dialog, DialogContent } from "@/components/ui/dialog.tsx";
import { useApi } from "@/utils/api/index.ts";
import { UpdateParticipant } from "@/chat/ChatApiCalls.ts";

export const ChatRoomContainer = () => {
  const api = useApi();
  const [askPassword, setAskPassword] = useState<boolean>(false);
  const { chatRooms } = useChatRoomsList();
  const { joinChatRoom } = useChat();
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null,
  );
  const [passwordInput, setPasswordInput] = useState("");
  const me = useUser();
  const { addParticipant } = useAddParticipant();

  const handleAddParticipant = async (userId: number, chatRoomId: number) => {
    if (!userId || !chatRoomId) {
      console.error("Invalid userId or chatRoomId");
      return;
    }
    await addParticipant(userId, chatRoomId);
  };
  const handeSwitchChatRoom = async (
    newChatRoom: ChatRoom,
    activeParticpant: boolean,
  ) => {
    localStorage.setItem("chatRoomId", JSON.stringify(newChatRoom.id));
    if (!activeParticpant) handleAddParticipant(me?.user.id, newChatRoom.id);
    else {
      const participant = newChatRoom.chatParticipants.find(
        (p) => p.userId === me?.user.id,
      );
      if (!participant) {
        console.error("Participant not found");
        return;
      }
      participant.leftAt = new Date(0);
      try {
        await UpdateParticipant(
          participant.chatRoomId,
          participant.userId,
          true,
        );
      } catch (error) {
        console.error("Error updating participant:", error);
      }
      joinChatRoom(newChatRoom.id);
    }
  };

  const handleChatRoomChange = (newChatRoom: ChatRoom) => {
    if (newChatRoom != null) {
      if (newChatRoom.chatParticipants.some((p) => p.userId === me?.user.id)) {
        handeSwitchChatRoom(newChatRoom, true);
        return;
      }
      if (newChatRoom.chatRoomType === "protected") {
        setAskPassword(true);
        setSelectedChatRoom(newChatRoom);
        return;
      }
      handeSwitchChatRoom(newChatRoom, false);
    }
  };
  const validatePassword = async (password: string): Promise<boolean> => {
    const response = await api.ChatRooms.chatRoomsControllerCheckPassword({
      checkPasswordDto: {
        password: password,
        chatRoomId: selectedChatRoom?.id,
      },
    });
    if (response) {
      return true;
    }
    return false;
  };

  const handlePasswordSubmit = async (password: string) => {
    const isValid = await validatePassword(password);
    setAskPassword(false);
    if (isValid) {
      handeSwitchChatRoom(selectedChatRoom, false);
    }
    return isValid;
  };
  return (
    <div className="chatRoomBox">
      <Dialog open={askPassword} onOpenChange={setAskPassword}>
        <DialogContent>
          {
            <div className="flex flex-col gap-4">
              <h1>This chat room requires a password</h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handlePasswordSubmit(passwordInput);
                }}
              >
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
                <button type="submit">Submit</button>
              </form>
            </div>
          }
        </DialogContent>
      </Dialog>
      <ChatRoomList
        chatRooms={chatRooms}
        userId={me.user.id}
        onChatRoomChange={handleChatRoomChange}
        askPassword={askPassword}
        setAskPassword={setAskPassword}
      />
    </div>
  );
};
