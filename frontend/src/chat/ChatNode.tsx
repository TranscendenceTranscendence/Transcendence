import React from "react";
import { useNavigate } from "react-router-dom";
import { ChatParticipantResponse } from "@/generated-api";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

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
  if (loading) return <li>Loading user data...</li>;

  if (!user || !user[0]) return <li>User not found</li>;
  const userId = user[0].userId;
  const realUser = user[0].user.avatar;
  // if (userId) {
  //   console.log("userId", userId);
  // } else {
  //   console.error("User ID is undefined");
  // }
  if (!userId) {
    console.error("User ID is undefined");
    return <li>Invalid user data</li>;
  }

  const handleRedirect = () => {
    navigate(`/profile/${userId}`);
  };
  if (realUser) console.log("chatNode", realUser);
  else console.error("Werkt niet");
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
