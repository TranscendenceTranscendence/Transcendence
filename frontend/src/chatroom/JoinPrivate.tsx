import React, { useEffect, useState } from "react";
import { useFetchRequest, useFetchRequestDep } from "../utils/FetchRequest.tsx";


enum chat_room_types {
    Public = "public",
    Protected = "protected",
    Private = "private"
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
    chatRooms: ChatRoom[];
    onChatRoomChange: (newChatRoom: ChatRoom) => void;
}

export const JoinPrivate: React.FC<JoinPrivateProps> = ({ chatRooms, onChatRoomChange }) => {
    const [roomName, setRoomName] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [refetch, setRefetch] = useState<boolean>(false);
    const url = 'https://localhost:3000/chatroom';
    const { data: fetched, error, loading } = useFetchRequestDep<ChatRoom[]>(url, refetch);
    // vervangen

    const HandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const selectedChatRoom = fetched?.find((room) => room.title === roomName);

        if (selectedChatRoom) {
            setSelectedRoom(selectedChatRoom); // Store the selected room
            console.log("Selected Chat Room:", selectedChatRoom);
        } else {
            console.log("Chat room not found");
        }
        onChatRoomChange(selectedChatRoom);
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

            {selectedRoom && (
                <div>
                    <h3>Selected Room Details</h3>
                    <p>Title: {selectedRoom.title}</p>
                    <p>Type: {selectedRoom.chat_room_type}</p>
                </div>
            )}
        </div>
    );
};
