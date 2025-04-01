import { useApi } from "@/utils/api/index.ts";
import {
  ChatParticipant,
  UpdateChatParticipantDto,
  UpdateChatParticipantDtoChatParticipantRoleEnum,
} from "@/generated-api/index.ts";

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
  const muteUntil = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes
  console.log("Mute Until:", muteUntil.toISOString());
  const updateDto: UpdateChatParticipantDto = {
    isMuted: true,
    bannedUntil: muteUntil,
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

export const BlockUser = async (chatRoomId, id) => {
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
