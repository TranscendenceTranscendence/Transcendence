import { useApi } from "@/utils/api/index.ts";
import {
  UpdateAddUserToBlockedListDto,
  UpdateChatParticipantDto,
  UpdateChatParticipantDtoChatParticipantRoleEnum,
} from "@/generated-api/index.ts";
import { User } from "@/generated-api/models/User.ts";
import { Blocked } from "@/generated-api/models/Blocked.ts";

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
  const muteUntil = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes
  const updateDto: UpdateChatParticipantDto = {
    isMuted: true,
    bannedUntil: muteUntil,
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

export const BlockUser = async (
  chatRoomId: number,
  id: number,
  blockedList: Blocked[],
  targetUser: User,
) => {
  const api = useApi();
  const updateDto: UpdateAddUserToBlockedListDto = {
    blockedUsers: blockedList,
    targerUser: targetUser,
    nickname: "",
    avatar: "",
    twoFactorEnabled: false,
  };
  try {
    await api.Users.usersControllerUpdateAddUserToBlockedList({
      updateAddUserToBlockedListDto: updateDto,
    });
  } catch (error) {
    console.error("Error updating user:", error);
  }
};
