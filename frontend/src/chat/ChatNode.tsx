import { ChatMessage, ChatParticipant } from "@/generated-api/index.ts";

interface ChatNodeProps {
  message: ChatMessage;
  user: ChatParticipant;
  loading: boolean;
}

export const ChatNode = ({ message, user, loading }: ChatNodeProps) => {
  if (loading) return <li>Loading user data...</li>;

  console.log("User:", user);
  console.log("Message:", message);

  if (!user) return <li>User not found</li>;

  return (
    <li>
      {message.content} - Sent by: {user?.userId}
    </li>
  );
};
