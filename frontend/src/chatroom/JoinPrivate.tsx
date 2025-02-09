import React, { useState } from "react";
import { useFetchRequestDep } from "../utils/FetchRequest.tsx";

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

interface JoinPrivateProps {
  onChatRoomChange: (newChatRoom: ChatRoom) => void;
}

export const JoinPrivate: React.FC<JoinPrivateProps> = ({
  onChatRoomChange,
}) => {
  const [roomName, setRoomName] = useState("");
  const url = "https://localhost:3000/chatroom";
  const { data: fetched } = useFetchRequestDep<ChatRoom[]>(url, roomName);

  const HandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const selectedChatRoom = fetched?.find((room) => room.title === roomName);

    if (selectedChatRoom) {
      console.log("Selected Chat Room:", selectedChatRoom);
      onChatRoomChange(selectedChatRoom);
    } else {
      console.log("Chat room not found");
    }
  };

  return (
    <div>
      <form onSubmit={HandleSubmit}>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter chat room title"
          required
        />
        <button type="submit">Join</button>
      </form>

      {fetched && fetched.length > 0 && (
        <div>
          <h3>Available Rooms</h3>
          <ul>
            {fetched.map((room) => (
              <li key={room.id}>{room.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
