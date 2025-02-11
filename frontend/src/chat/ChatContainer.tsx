import "../css/ChatBox.css";
import { ChatBox } from "./ChatBox.tsx";
import io from "socket.io-client";

interface ChatContainerProps {
  chatRoomId: number;
  userId: number;
}

const ChatContainer = ({ chatRoomId, userId }: ChatContainerProps) => {
  const socket = io("wss://localhost:3000", {
    reconnectionAttempts: 5,
    transports: ["websocket"],
  });
  return (
    <div className="chatBox">
      <div className="chatContainer">
        <ChatBox socket={socket} chatRoomId={chatRoomId} userId={userId} />
      </div>
    </div>
  );
};

export default ChatContainer;
