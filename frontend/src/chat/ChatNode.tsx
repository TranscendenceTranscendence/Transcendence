import React from "react";

interface oldMessage {
  content: string;
  user_id: number;
}

enum chat_participant_roles {
  Owner = "owner",
  Admin = "admin",
  Guest = "guest",
}

interface Participants {
  user_id: number | null;
  chat_room_id: number | null;
  chat_participant_role: chat_participant_roles;
}

interface ChatNodeProps {
  message: oldMessage;
  user: Participants[];
  loading: boolean;
}

export const ChatNode = ({ message, user, loading }: ChatNodeProps) => {
  if (loading) {
    return <li>Loading user data...</li>;
  }
  console.log("user --> ", user);
  console.log("message id -->", message);
  if (!user || user.length === 0) {
    return <li>User not found</li>;
  }

  return (
    <li>
      {message.content} - Sent by: {user[0]?.user_id}
    </li>
  );
};
