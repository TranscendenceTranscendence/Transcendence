import React, { useState, useEffect } from "react";
import "../css/Chatroom.css";
import { PasswordPrompt } from "./PasswordPrompt.tsx";
import { OnlineDot } from "./OnlineDot.tsx";

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
  chatRooms: ChatRoom[];
  userId: number;
  onChatRoomChange: (newChatRoom: ChatRoom) => void;
  askPassword: boolean;
  setAskPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  chatRooms,
  onChatRoomChange,
  userId,
  askPassword,
  setAskPassword,
}) => {
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null,
  );

  useEffect(() => {
    if (
      selectedChatRoom &&
      selectedChatRoom.chat_room_type === chat_room_types.Protected
    ) {
      setAskPassword(true);
    } else {
      setAskPassword(false);
    }
  }, [selectedChatRoom, setAskPassword]);

  const CheckIfActive = (
    chatParticipants: Participant[] | undefined,
  ): boolean => {
    return (
      chatParticipants?.some((participant) => participant.user_id === userId) ??
      false
    );
  };

  const changeChatRoom = (newId: number) => {
    const chatRoom = chatRooms.find((room) => room.id === newId) ?? null;
    setSelectedChatRoom(chatRoom);
    if (
      chatRoom?.chat_room_type !== chat_room_types.Protected ||
      CheckIfActive(chatRoom.chatParticipants)
    ) {
      onChatRoomChange(chatRoom);
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
    if (await validatePassword(password)) {
      onChatRoomChange(selectedChatRoom);
    } else {
      console.log("Wrong password");
    }
    setAskPassword(false);
  };

  const filteredChatRooms = chatRooms.filter((room) => {
    return (
      room.chat_room_type !== chat_room_types.Private ||
      CheckIfActive(room.chatParticipants)
    );
  });

  return (
    <div>
      <div className="PromptContainer">
        {askPassword && <PasswordPrompt onSubmit={handlePasswordSubmit} />}
      </div>
      <ul className="rooms">
        {filteredChatRooms.length > 0 ? (
          filteredChatRooms.map((chatroom, index) => (
            <div
              key={index}
              className="node"
              onClick={() => changeChatRoom(chatroom.id)}
            >
              <OnlineDot status={CheckIfActive(chatroom.chatParticipants)} />
              <li>{chatroom.title}</li>
              <li>{chatroom.chat_room_type}</li>
            </div>
          ))
        ) : (
          <p>No chatRooms found.</p>
        )}
      </ul>
    </div>
  );
};
