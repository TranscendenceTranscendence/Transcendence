import React from "react";
import { useNavigate } from "react-router-dom";
import { ChatParticipantResponse } from "@/generated-api";

interface ChatNodeProps {
  message: { content: string };
  user: ChatParticipantResponse | null;
  loading: boolean;
}

export const ChatNode: React.FC<ChatNodeProps> = ({
  message,
  user,
  loading,
}) => {
  const navigate = useNavigate();
  // console.log("info", message, user, loading);
  if (loading) return <li>Loading user data...</li>;

  if (!user || !user[0]) return <li>User not found</li>;
  const userId = user[0].userId;
  if (userId) {
    console.log("userId", userId);
  } else {
    console.error("User ID is undefined");
  }
  if (!userId) {
    console.error("User ID is undefined");
    return <li>Invalid user data</li>;
  }

  const handleRedirect = () => {
    navigate(`/profile/${userId}`);
  };

  return (
    <li onClick={handleRedirect} style={{ cursor: "pointer" }}>
      {message.content} - Sent by: {userId}
    </li>
  );
};
