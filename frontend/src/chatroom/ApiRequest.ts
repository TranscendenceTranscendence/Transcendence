import { useEffect, useState } from "react";
import { useApi } from "@/utils/api/index.ts";
import { ChatRoomsResponse } from "@/generated-api/index.ts";

export const useChatRooms = () => {
  const api = useApi();
  const [chatRooms, setChatRooms] = useState<ChatRoomsResponse | null>(null);

  const fetchChatRooms = async () => {
    try {
      const response: ChatRoomsResponse =
        await api.ChatRooms.chatRoomsControllerFindAll();

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

export const useChatRoomsList = () => {
  const api = useApi();
  const [chatRooms, setChatRooms] = useState<ChatRoomsResponse | null>(null);

  const fetchChatRooms = async () => {
    try {
      const response: ChatRoomsResponse =
        await api.ChatRooms.chatRoomsControllerFindAllChatRoomList();

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

export const useChatRoomsForPrivateInvite = () => {
  const api = useApi();
  const [chatRooms, setChatRooms] = useState<ChatRoomsResponse | null>(null);

  const fetchChatRooms = async () => {
    try {
      const response: ChatRoomsResponse =
        await api.ChatRooms.chatRoomsControllerFindAllPrivateChatRoomList();

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

export const useAddParticipant = () => {
  const api = useApi();

  const addParticipant = async (userId: number, chatRoomId: number) => {
    try {
      await api.ChatParticipants.chatParticipantsControllerAddParticipantToChatroom(
        {
          chatRoomId,
          userId,
        },
      );
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  return { addParticipant };
};

// export const checkPassword = () => {
//   const api = useApi();

//   const checkPassword = async () => {
//     try {
//       await api.ChatRooms.
//     }
//   }
// }
