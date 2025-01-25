import React from "react";

interface oldMessage {
  content: string;
  user_id: number;
  user: Participant;
}

enum chat_participant_roles {
  Owner = "owner",
  Admin = "admin",
  Guest = "guest"
}

interface Participant {
  user_id: number | null;
  chat_room_id: number | null;
  chat_participant_role: chat_participant_roles
}

export const ChatNode = (props: {
  message: oldMessage;
  loading: boolean;
  userId: number;
}) => {
  const {
    message,
    loading,
    userId,
  } = props;
  if (loading) {
    return <li>Loading user data...</li>;
  }
  // console.table(message);
  if (!message.user) {
    return (
      <li>User not found</li>
    )
  }

  return (
    <li>
      {message.content} - Sent by: {message.user_id === userId ? 'You' : message.user_id}
    </li>
  );
};

