import React from "react";
import axios from "axios";
import { deleteItem } from "../utils/DeleteRequest.tsx";

export enum chat_participant_roles {
  Owner = "owner",
  Admin = "admin",
  Guest = "guest"
}

export const KickUser = (chatRoomId, userId) => {
    console.log(userId);
    deleteItem(chatRoomId, userId);
}

export const PromoteUser = async (chatRoomId, id) => {
  const updateDto = {
    chat_participant_role : chat_participant_roles.Admin,
  };
    try {
      const response = await axios.put(`https://localhost:3000/chatParticipants/${chatRoomId}/update/${id}`, updateDto);
      console.log('Update Successful:', response.data);
    } catch (error) {
      console.error('Error updating user:', error);
    }
}

export const MuteUser = async (chatRoomId, id) => {
  const updateDto = {
    chat_participant_role : chat_participant_roles.Admin,
  };
    try {
      const response = await axios.put(`https://localhost:3000/chatParticipants/${chatRoomId}/update/${id}`, updateDto);
      console.log('Update Successful:', response.data);
    } catch (error) {
      console.error('Error updating user:', error);
    }
}

export const BlockUser = async (chatRoomId, id) => {
  const updateDto = {
    chat_participant_role : chat_participant_roles.Admin,
  };
    try {
      const response = await axios.put(`https://localhost:3000/chatParticipants/${chatRoomId}/update/${id}`, updateDto);
      console.log('Update Successful:', response.data);
    } catch (error) {
      console.error('Error updating user:', error);
    }
}