import axios from "axios";

export enum chat_participant_roles {
  Owner = "owner",
  Admin = "admin",
  Guest = "guest",
}

export const handleSubmitMessages = async (
  url,
  message,
  userId,
  chatRoomId
) => {
  try {
    const res = await axios.post(url, {
      content: message,
      user_id: userId,
      chat_room_id: chatRoomId,
    }); 
    return res.data;
  } catch (error) {
    console.error("Error:", error);
    if (axios.isAxiosError(error)) {
      return {
        error: error.response ? error.response.data : "Failed to send message",
      };
    } else {
      return { error: "Failed to send message" };
    }
  }
};
