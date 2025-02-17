import { useEffect, useState } from "react";
import { useApi } from '@/utils/api/index.ts';
import { ChatRoomsResponse } from '@/generated-api/index.ts';

export const useChatRooms = () => {
    const api = useApi();
    const [chatRooms, setChatRooms] = useState<ChatRoomsResponse | null>(null);
  
    const fetchChatRooms = async () => {
      try {
        const response: ChatRoomsResponse = await api.ChatRooms.chatRoomsControllerFindAllincludeParticipant();
        console.log("ChatRoomsResponse:", response);
  
        if (response.success) {
          setChatRooms(response);
        } else {
          console.error("Failed to fetch chat rooms:", response.message);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      }
    };
  
    useEffect(() => {
      fetchChatRooms();
    }, []);
  
    return { chatRooms, fetchChatRooms };
  };

export const UseaddParticipant = (userId : number, chatRoomId : number) => {
  const api = useApi();
  
    const addParticipant = async (userId: number, chatRoomId: number) => {
      try {
        const response = await api.ChatParticipants.chatParticipantsControllerAddParticipantToChatroom({
          chatRoomId,
          userId,
        });
        console.log('Participant added:', response);
      } catch (error) {
        console.error('Error adding participant:', error);
      }
    };

    useEffect(() => {
      addParticipant(userId, chatRoomId);
    });
}
