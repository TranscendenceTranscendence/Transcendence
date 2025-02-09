import React, { useCallback } from "react";
import "../css/Chatroom.css";
import { PasswordPrompt } from "./PasswordPrompt";
import { OnlineDot } from "./OnlineDot";

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

interface ChatRoomListProps {
  chatRooms?: ChatRoom[];
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
    [onChatRoomChange]
  );

  return (
    <div className="chat-room-list">
      {chatRooms.map((chatRoom) => (
        <div key={chatRoom.id} className="chat-room-item">
          <h3>{chatRoom.title}</h3>
          <OnlineDot status={chatRoom.chatParticipants.some(p => p.user_id === userId)} />
          {chatRoom.chat_room_type === chat_room_types.Protected && askPassword && (
            <PasswordPrompt
              chatRoom={chatRoom}
              setAskPassword={setAskPassword}
            />
          )}
          <button onClick={() => handleChatRoomChange(chatRoom)}>Join</button>
        </div>
      ))}
    </div>
  );
};

export default React.memo(ChatRoomList);