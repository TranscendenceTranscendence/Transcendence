import { ChatMessage, ChatParticipant } from "@/generated-api/index.ts";

interface ChatNodeProps {
  message: ChatMessage;
  user: ChatParticipant[];
  loading: boolean;
}

export const ChatNode = ({ message, user, loading }: ChatNodeProps) => {
  if (loading) return <li>Loading user data...</li>;

  if (!user || user.length === 0) return <li>User not found</li>;

  return (
    <li>
      {message.content} - Sent by: {user[0]?.userId}
    </li>
  );
};
