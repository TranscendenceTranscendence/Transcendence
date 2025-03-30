import React, { useEffect, useState } from "react";
import { useChat } from "@/utils/providers/ChatProvider";

const Chat = () => {
  const { chatRooms, sendMessage, currentChatRoomId, joinChatRoom } = useChat();

  useEffect(() => {
    joinChatRoom(1);
  }, []);

  const [message, setMessage] = useState<string>("");

  const handleSendMessage = () => {
    if (message.trim() && currentChatRoomId !== null) {
      sendMessage(message);
      setMessage("");
    }
  };

  const currentChatRoom = currentChatRoomId
    ? chatRooms[currentChatRoomId]
    : null;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {currentChatRoom && (
        <div className="bg-white shadow-lg rounded-lg p-4 w-[400px] h-[500px] overflow-hidden">
          <h3>Chat Room {currentChatRoomId}</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              height: "300px",
              overflowY: "scroll",
            }}
          >
            {currentChatRoom.messages.map((msg, index) => {
              const user = currentChatRoom.participants.find(
                (p) => p.user.id === msg.userId,
              ).user;
              if (!user) return null;
              return (
                <div key={index}>
                  <strong>{user.nickname}:</strong> {msg.content}
                </div>
              );
            })}
          </div>
          <div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
