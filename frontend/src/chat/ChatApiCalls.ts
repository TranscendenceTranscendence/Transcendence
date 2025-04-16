import {
  ChatRoomsResponse,
  MessagesResponse,
  ChatParticipantsResponse,
} from "@/generated-api/index.ts";
import { useApi } from "@/utils/api/index.ts";
import { useEffect, useState } from "react";
import { ChatRoomsControllerCreateRequest } from "@/generated-api/index.ts";

export const useChatRooms = () => {
  const api = useApi();
  const [chatRooms, setChatRooms] = useState<ChatRoomsResponse | null>(null);

  const fetchChatRooms = async () => {
    try {
      const response: ChatRoomsResponse =
        await api.ChatRooms.chatRoomsControllerFindAllincludeParticipant();
      // console.log("ChatRoomsResponse:", response);

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

export const useMessages = (chatroomId: number) => {
  const api = useApi();
  const [fetchedMessages, setFetchedMessages] =
    useState<MessagesResponse | null>(null);

  const fetchMessages = async () => {
    try {
      const response: MessagesResponse =
        await api.ChatMessages.chatMessagesControllerFind({
          chatRoomId: chatroomId,
          sentTimeFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          sentTimeTill: new Date(),
        });
      // console.log("MessagesResponse:", response);

      if (response.success) {
        setFetchedMessages(response);
      } else {
        console.error("Failed to fetch messages:", response.message);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return { fetchedMessages, fetchMessages };
};

export const useActiveParticipantbyChatroomId = (chatRoomId: number) => {
  const api = useApi();
  const [activeParticipants, setActiveParticipants] =
    useState<ChatParticipantsResponse | null>(null);

  const fetchActiveParticipants = async () => {
    try {
      const response: ChatParticipantsResponse =
        await api.ChatParticipants.chatParticipantsControllerFindParticipantByChatRoom(
          { chatRoomId },
        );
      // console.log("MessagesResponse:", response);

      if (response.success) {
        setActiveParticipants(response);
      } else {
        console.error("Failed to fetch chat rooms:", response.message);
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  useEffect(() => {
    fetchActiveParticipants();
  }, []);

  return { activeParticipants, fetchActiveParticipants };
};

export const useAddMessage = async (
  input: string,
  userId: number,
  chatRoomId: number,
) => {
  const api = useApi();

  try {
    const response = await api.ChatMessages.chatMessagesControllerCreate({
      content: input,
      user_id: userId,
      chat_room_id: chatRoomId,
    });
    void response;
    // console.log("Participant added:", response);
  } catch (error) {
    console.error("Error adding participant:", error);
  }
};

export const postDmChatRoom = async (
  api: ReturnType<typeof useApi>,
  userId: number,
  targetUser: number,
) => {
  try {
    const chatRoomData: ChatRoomsControllerCreateRequest = {
      createChatRoomDto: {
        title: "Dm",
        password: "",
        creationDate: new Date(),
        chatRoomType: "Dm",
        userId: userId,
        role: "guest",
        invitedUserId: targetUser,
      },
    };

    await api.ChatRooms.chatRoomsControllerCreate(chatRoomData);
  } catch (error) {
    console.error("Error creating chat room:", error);
  }
};
