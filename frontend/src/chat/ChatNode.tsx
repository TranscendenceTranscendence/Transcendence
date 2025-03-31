import React from "react";
import { useNavigate } from "react-router-dom";
import { ChatParticipant } from "@/generated-api";

interface ChatNodeProps {
  message: { content: string };
  user: ChatParticipant | null;
  loading: boolean;
}

export const ChatNode: React.FC<ChatNodeProps> = ({
  message,
  user,
  loading,
}) => {
  const navigate = useNavigate();
  if (loading) return <li>Loading user data...</li>;

  if (!user || !user[0]) return <li>User not found</li>;
  const userId = user[0].userId;
  if (!userId) {
    console.error("User ID is undefined");
    return <li>Invalid user data</li>;
  }
  console.log(userId, "this Node has a muted user -->", user[0].isMuted);
  const handleRedirect = () => {
    navigate(`/profile/${userId}`);
  };
  return (
    <div>
      <li>
        <p onClick={handleRedirect} style={{ cursor: "pointer" }}>
          {userId}
        </p>
        <p> {message.content}</p>
      </li>
    </div>
  );
};
