import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordPrompt } from "./PasswordPrompt";
import { OnlineDot } from "./OnlineDot";
import {
  ChatRoom,
  ChatRoomsResponse,
  ChatRoomChatRoomTypeEnum,
} from "@/generated-api/index.ts";

interface ChatRoomListProps {
  chatRooms?: ChatRoomsResponse;
  userId: number;
  onChatRoomChange: (newChatRoom: ChatRoom) => void;
  askPassword: boolean;
  setAskPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  chatRooms = [],
  onChatRoomChange,
  userId,
  askPassword,
  setAskPassword,
}) => {
  const handleChatRoomChange = useCallback(
    (newChatRoom: ChatRoom) => {
      onChatRoomChange(newChatRoom);
    },
    [onChatRoomChange],
  );

  return (
    <div className="chat-room-list flex flex-col gap-3 max-h-96 overflow-y-auto p-2">
      {chatRooms?.chatRooms?.map((chatRoom) => (
        <div key={chatRoom.id}>
          <Button
            key={chatRoom.id}
            onClick={() => handleChatRoomChange(chatRoom)}
            variant="ghost"
            className="p-0"
            asChild
          >
            <Card className="chat-room-item hover:shadow-lg transition cursor-pointer w-full">
              <CardContent className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <h3 className="text-lg font-semibold truncate">
                    {chatRoom.title}
                  </h3>
                  <OnlineDot
                    status={chatRoom.chatParticipants.some(
                      (p) => p.user_id === userId,
                    )}
                  />
                </div>
                {chatRoom.chat_room_type ===
                  ChatRoomChatRoomTypeEnum.Protected &&
                  askPassword && (
                    <PasswordPrompt
                      chatRoom={chatRoom}
                      setAskPassword={setAskPassword}
                    />
                  )}
              </CardContent>
            </Card>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default React.memo(ChatRoomList);
