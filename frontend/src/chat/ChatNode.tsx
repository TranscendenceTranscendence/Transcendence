import React from "react";
import { useNavigate } from "react-router-dom";
interface ChatNodeProps {
  message: { content: string };
  user: { userId: number } | null;
  loading: boolean;
}

export const ChatNode: React.FC<ChatNodeProps> = ({
  message,
  user,
  loading,
}) => {
  const navigate = useNavigate();

  if (loading) return <li>Loading user data...</li>;

  if (!user) return <li>User not found</li>;
  console.log("User:", user.userId);
  console.log("User JSON:", JSON.stringify(user, null, 2));

  const handleRedirect = () => {
    navigate(`/profile/${user.userId}`);
  };

  return (
    <li onClick={handleRedirect} style={{ cursor: "pointer" }}>
      {message.content} - Sent by: {user.userId}
    </li>
  );
};
