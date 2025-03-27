import { UserContextType } from "@/utils/providers/UserProvider.tsx";
import "../css/ChatBox.css";
import { ChatBox } from "./ChatBox.tsx";
import io from "socket.io-client";
import { User } from "@/generated-api";

interface ChatContainerProps {
  chatRoomId: number;
  user: User;
}

const ChatContainer = ({ chatRoomId, user }: ChatContainerProps) => {
  const socket = io("wss://localhost:3000", {
    reconnectionAttempts: 5,
    transports: ["websocket"],
  });
  if (!user)
    return (
      <div className="chatBox">
        <div className="chatContainer">
          <h1>Chat is not available</h1>
        </div>
      </div>
    );

  return (
    <div className="chatBox">
      <div className="chatContainer">
        <ChatBox socket={socket} chatRoomId={chatRoomId} userId={user.id} />
      </div>
    </div>
  );
};

export default ChatContainer;
