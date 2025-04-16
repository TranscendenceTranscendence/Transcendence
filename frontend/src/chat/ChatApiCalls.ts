import {
  ChatRoomsResponse,
  MessagesResponse,
  ChatParticipantsResponse,
} from "@/generated-api/index.ts";
import { useApi } from "@/utils/api/index.ts";
import { useEffect, useState } from "react";
import {
  UpdateChatParticipantDto,
  UpdateChatParticipantDtoChatParticipantRoleEnum,
} from "@/generated-api/index.ts";
import {
  ChatParticipant,
  UpdateAddUserToBlockedListDto,
} from "@/generated-api/index.ts";

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

export const KickUser = async (chatRoomId: number, id: number) => {
  const api = useApi();
  try {
    await api.ChatParticipants.chatParticipantsControllerRemove({
      chatRoomId,
      id,
    });
    console.log("Item deleted successfully");
  } catch (error) {
    console.error("Error deleting item:", error);
  }
};

export const PromoteUser = async (chatRoomId, id) => {
  const api = useApi();
  const updateDto: UpdateChatParticipantDto = {
    chatParticipantRole: UpdateChatParticipantDtoChatParticipantRoleEnum.Admin,
  };
  try {
    const response: ChatParticipant =
      await api.ChatParticipants.chatParticipantsControllerUpdateParticipant({
        chatRoomId,
        id,
        updateChatParticipantDto: updateDto,
      });
    console.log("Update Successful:", response);
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

export const MuteUser = async (chatRoomId, id) => {
  const api = useApi();
  const updateDto: UpdateChatParticipantDto = {
    isMuted: true,
  };
  try {
    const response: ChatParticipant =
      await api.ChatParticipants.chatParticipantsControllerUpdateParticipant({
        chatRoomId,
        id,
        updateChatParticipantDto: updateDto,
      });
    console.log("Update Successful:", response);
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

export const BlockUser = async (targetUser: number) => {
  const api = useApi();
  const updateDto: UpdateAddUserToBlockedListDto = {
    targetUserId: targetUser,
  };
  try {
    const response = await api.Users.usersControllerUpdateAddUserToBlockedList({
      updateAddUserToBlockedListDto: updateDto,
    });
    console.log("User successfully blocked:", response);
  } catch (error) {
    console.error("Error blocking user:", error);
  }
};
