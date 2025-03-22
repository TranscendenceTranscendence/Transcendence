import { useEffect, useState } from "react";
import { handleSubmitMessages } from "../utils/PostRequest.tsx";
import { ChatNode } from "./ChatNode.tsx";
import React from "react";
import { KickUser, PromoteUser } from "./utils.ts";
import {
  useActiveParticipantbyChatroomId,
  useMessages,
} from "./ChatApiCalls.ts";
import { Socket } from "socket.io-client";
import { ChatMessage } from "@/generated-api/index.ts";

enum chat_participant_roles {
  Owner = "owner",
  Admin = "admin",
  Guest = "guest",
}

const addStyle = (value: boolean) => {
  return value == true ? "chatUser" : "chatContact";
};

interface ChatBoxProps {
  socket: Socket;
  chatRoomId: number;
  userId: number;
}

export const ChatBox = ({ socket, chatRoomId, userId }: ChatBoxProps) => {
  const { fetchedMessages } = useMessages(chatRoomId);
  const { activeParticipants } = useActiveParticipantbyChatroomId(chatRoomId);
  const localParticipant = activeParticipants?.chatParticipants.find(
    (participant) => participant.userId?.toString() == userId.toString(),
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    fetchedMessages?.data || [],
  );
  const [input, setInput] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<{
    userId: number;
    x: number;
    y: number;
  } | null>(null);
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.data) {
      setMessages(fetchedMessages.data);
    }
  }, [fetchedMessages]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    const handleReceiveMessage = (message) => {
      console.log("!!!!!!!!!!!!");
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = { content: input, user_id: userId };
      socket.emit("sendMessage", newMessage);
      handleSubmitMessages(
        "https://localhost:3000/chatMessages",
        input,
        userId,
        chatRoomId,
      );
      setInput("");
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleMessageClick = (e: React.MouseEvent, user_id: number) => {
    e.stopPropagation();
    setSelectedMessage({
      userId: user_id,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleOutsideClick = () => {
    setSelectedMessage(null);
  };

  const handleAction = (action: string, id: number) => {
    if (action == "Kick") KickUser(chatRoomId, id);
    else if (action == "Promote") PromoteUser(chatRoomId, id);
    // else if (action == 'Mute')
    //   MuteUser(userId);
    // else if (action == 'Block')
    //   BlockUser(userId);

    console.log(`${action} user with ID: ${id}`);
    setSelectedMessage(null);
  };

  return (
    <div>
      <ul className="chatMessages">
        {Array.isArray(messages) ? (
          messages.map((message, index) => (
            <div
              key={index}
              className={addStyle(
                message.userId?.toString() === userId.toString(),
              )}
              onClick={(e) => handleMessageClick(e, message.userId)}
            >
              <ChatNode
                key={index}
                message={message}
                user={activeParticipants?.chatParticipants.filter(
                  (participant) => participant.userId == message.userId,
                )}
                loading={false}
              />
            </div>
          ))
        ) : (
          <p>No messages found.</p>
        )}
      </ul>
      <div className="formMessages">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>

      {selectedMessage && (
        <div
          className="messagePrompt"
          style={{
            position: "absolute",
            top: selectedMessage.y,
            left: selectedMessage.x,
            background: "white",
            border: "1px solid black",
            padding: "10px",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p>Actions for User {selectedMessage.userId}:</p>
          {(localParticipant?.chatParticipantRole ==
            chat_participant_roles.Owner ||
            localParticipant?.chatParticipantRole ==
              chat_participant_roles.Admin) && (
            <button
              onClick={() => handleAction("Kick", selectedMessage.userId)}
            >
              Kick
            </button>
          )}
          {(localParticipant?.chatParticipantRole ==
            chat_participant_roles.Owner ||
            localParticipant?.chatParticipantRole ==
              chat_participant_roles.Admin) && (
            <button
              onClick={() => handleAction("Promote", selectedMessage.userId)}
            >
              Promote
            </button>
          )}
          {(localParticipant?.chatParticipantRole ==
            chat_participant_roles.Owner ||
            localParticipant?.chatParticipantRole ==
              chat_participant_roles.Admin) && (
            <button
              onClick={() => handleAction("Mute", selectedMessage.userId)}
            >
              Mute
            </button>
          )}
          <button onClick={() => handleAction("Block", selectedMessage.userId)}>
            Block
          </button>
        </div>
      )}
    </div>
  );
};
