import { deleteItem } from "../utils/DeleteRequest.tsx";
import { useApi } from "@/utils/api/index.ts";
import { ChatParticipant, UpdateChatParticipantDto, UpdateChatParticipantDtoChatParticipantRoleEnum } from "@/generated-api/index.ts";


export const KickUser = (chatRoomId, userId) => {
    console.log(userId);
    deleteItem(chatRoomId, userId);
}

export const PromoteUser = async (chatRoomId, id) => {
  const api = useApi(); 
  const updateDto: UpdateChatParticipantDto = {
    chatParticipantRole: UpdateChatParticipantDtoChatParticipantRoleEnum.Admin,
  };
  try {
    const response: ChatParticipant = await api.ChatParticipants.chatParticipantsControllerUpdateParticipant({
      chatRoomId,
      id,
      updateChatParticipantDto: updateDto,
    });
    console.log('Update Successful:', response);
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

export const MuteUser = async (chatRoomId, id) => {
  const api = useApi();
  const updateDto : UpdateChatParticipantDto = {
    chatParticipantRole : UpdateChatParticipantDtoChatParticipantRoleEnum.Admin,
  };
    try {
      const response : ChatParticipant = await api.ChatParticipants.chatParticipantsControllerUpdateParticipant({ chatRoomId, id, updateChatParticipantDto: updateDto });
      console.log('Update Successful:', response);
    } catch (error) {
      console.error('Error updating user:', error);
    }
}

export const BlockUser = async (chatRoomId, id) => {
  const api = useApi();
  const updateDto: UpdateChatParticipantDto = {
    chatParticipantRole: UpdateChatParticipantDtoChatParticipantRoleEnum.Admin,
  };
  try {
    const response: ChatParticipant = await api.ChatParticipants.chatParticipantsControllerUpdateParticipant({
      chatRoomId,
      id,
      updateChatParticipantDto: updateDto,
    });
    console.log('Update Successful:', response);
  } catch (error) {
    console.error('Error updating user:', error);
  }
}