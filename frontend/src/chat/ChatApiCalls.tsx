import { MeResponseSuccess, ChatRoomsResponse } from '@/generated-api/index.ts';
import { useApi } from '@/utils/api/index.ts';
import { useEffect, useState } from 'react';

export const useUserDetails = () => {
    const [userDetails, setUserDetails] = useState<MeResponseSuccess | null>(null);
    const api = useApi();

    const fetchUserDetails = async () => {
        try {
            const userDetails: MeResponseSuccess = await api.Users.usersControllerMe();
            console.log("User details:", userDetails);
            if (userDetails?.id) {
                setUserDetails(userDetails);
                localStorage.setItem('localUserId', JSON.stringify(userDetails.id));
            }
        } catch (error) {
            console.error("Failed to fetch user details:", error);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);
    return { userDetails, fetchUserDetails };
};

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