import { useState } from "react";
import ChatRoomList from "./ChatRoomList.tsx";
import { ChatRoom } from "@/generated-api/index.ts";
import { useChatRooms, useAddParticipant } from "./ApiRequest.ts";
import { useUser } from "@/utils/providers/UserProvider.tsx";
import { useChat } from "@/utils/providers/ChatProvider.tsx";
import { Dialog, DialogContent } from "@/components/ui/dialog.tsx";

export const ChatRoomContainer = () => {
  const [askPassword, setAskPassword] = useState<boolean>(false);
  const { chatRooms } = useChatRooms();
  const { joinChatRoom } = useChat();
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null,
  );
  const [passwordInput, setPasswordInput] = useState("");
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
  const handeSwitchChatRoom = (
    newChatRoom: ChatRoom,
    activeParticpant: boolean,
  ) => {
    localStorage.setItem("chatRoomId", JSON.stringify(newChatRoom.id));
    if (!activeParticpant) handleAddParticipant(me?.user.id, newChatRoom.id);
    joinChatRoom(newChatRoom.id);
  };

  const handleChatRoomChange = (newChatRoom: ChatRoom) => {
    if (newChatRoom != null) {
      if (newChatRoom.chatParticipants.some((p) => p.userId === me?.user.id)) {
        console.log("already in chat room");
        handeSwitchChatRoom(newChatRoom, true);
        return;
      }
      if (newChatRoom.chatRoomType === "protected") {
        console.log("ask password");
        setAskPassword(true);
        setSelectedChatRoom(newChatRoom);
        return;
      }
      handeSwitchChatRoom(newChatRoom, false);
    }
  };
  const validatePassword = async (password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(password === selectedChatRoom?.password);
      }, 1000);
    });
  };

  const handlePasswordSubmit = async (password: string) => {
    console.log(password + " real password ---> " + selectedChatRoom?.password);
    const isValid = await validatePassword(password);
    setAskPassword(false);
    if (isValid) {
      handeSwitchChatRoom(selectedChatRoom, false);
    } else {
      console.log("Invalid password");
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
              <p>test</p>
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
