import {
  ChatRoomsResponse,
  ChatRoomResponse,
  MessagesResponse,
  ChatParticipantsResponse,
} from "@/generated-api/index.ts";
import { useApi } from "@/utils/api/index.ts";
import { useEffect, useState } from "react";
import { ChatRoomsControllerCreateRequest } from "@/generated-api/index.ts";
import {
  UpdateChatParticipantDto,
  UpdateChatParticipantDtoChatParticipantRoleEnum,
} from "@/generated-api/index.ts";
import { UpdateAddUserToBlockedListDto } from "@/generated-api/index.ts";

export const useChatRooms = () => {
  const api = useApi();
  const [chatRooms, setChatRooms] = useState<ChatRoomsResponse | null>(null);

  const fetchChatRooms = async () => {
    try {
      const response: ChatRoomsResponse =
        await api.ChatRooms.chatRoomsControllerFindAllincludeParticipant();

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

    const response: ChatRoomResponse =
      await api.ChatRooms.chatRoomsControllerCreate(chatRoomData);
    if (response.success) {
      return response;
    } else {
      console.error("Failed to create chat room:", response.message);
      return null;
    }
  } catch (error) {
    console.error("Error creating chat room:", error);
    return null;
  }
};

export const KickUser = async (chatRoomId: number, id: number) => {
  const api = useApi();
  try {
    await api.ChatParticipants.chatParticipantsControllerRemove({
      chatRoomId,
      id,
    });
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
    await api.ChatParticipants.chatParticipantsControllerUpdateParticipant({
      chatRoomId,
      id,
      updateChatParticipantDto: updateDto,
    });
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

export const MuteUser = async (chatRoomId, id) => {
  const api = useApi();
  const updateDto: UpdateChatParticipantDto = {
    isMuted: true,
    bannedUntil: new Date(Date.now() + 10 * 60 * 1000),
  };
  try {
    await api.ChatParticipants.chatParticipantsControllerUpdateParticipant({
      chatRoomId,
      id,
      updateChatParticipantDto: updateDto,
    });
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
    await api.Users.usersControllerUpdateAddUserToBlockedList({
      updateAddUserToBlockedListDto: updateDto,
    });
  } catch (error) {
    console.error("Error blocking user:", error);
  }
};

export const UpdateParticipant = async (
  chatRoomId: number,
  id: number,
  reset: boolean,
) => {
  const api = useApi();
  const updateDto: UpdateChatParticipantDto = {
    leftAt: reset ? new Date(0) : new Date(),
  };
  try {
    await api.ChatParticipants.chatParticipantsControllerUpdateParticipant({
      id,
      chatRoomId,
      updateChatParticipantDto: updateDto,
    });
  } catch (error) {
    console.error("Error updating user:", error);
  }
};
