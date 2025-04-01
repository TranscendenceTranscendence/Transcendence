import { useEffect, useState } from "react";
import { handleSubmitMessages } from "../utils/PostRequest.tsx";
import { ChatNode } from "./ChatNode.tsx";
import React from "react";
import { KickUser, PromoteUser, MuteUser, BlockUser } from "./utils.ts";
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
  const { activeParticipants } = useActiveParticipantbyChatroomId(chatRoomId);
  const localParticipant = activeParticipants?.chatParticipants.find(
    (participant) => participant.userId?.toString() == userId.toString(),
  );
  const { fetchedMessages } = useMessages(chatRoomId);
  const [messages, setMessages] = useState<ChatMessage[]>(
    fetchedMessages?.data || [],
  );
  const [input, setInput] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<{
    userId: number;
    x: number;
    y: number;
  } | null>(null);

  if (localParticipant?.isMuted == true) {
    const currentTime = new Date();
    console.log("true!!", currentTime, " | ", localParticipant?.bannedUntil);
    if (currentTime > localParticipant?.bannedUntil) {
      console.log("User is unmuted");
      localParticipant.isMuted = false;
    }
  }
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.data) {
      setMessages(fetchedMessages.data);
    }
  }, [fetchedMessages]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("WebSocket connected");
      socket.emit("joinRoom", chatRoomId);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        content: input,
        userId: userId,
      };
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
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setSelectedMessage({
      userId: user_id,
      x: rect.left + window.scrollX - 175,
      y: rect.top + window.scrollY - 125,
    });
  };

  const handleOutsideClick = () => {
    setSelectedMessage(null);
  };

  const handleAction = (action: string, id: number) => {
    if (action == "Kick") KickUser(chatRoomId, id);
    else if (action == "Promote") PromoteUser(chatRoomId, id);
    else if (action == "Mute") MuteUser(chatRoomId, id);
    else if (action == "Block") BlockUser(chatRoomId, id);

    console.log(`${action} on user with ID: ${id}`);
    setSelectedMessage(null);
  };
  if (localParticipant == undefined) {
    return <p>Chat not available</p>;
  }
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
                  (participant) => {
                    return participant.userId == message.userId;
                  },
                )}
                loading={false}
              />
            </div>
          ))
        ) : (
          <p>No messages found.</p>
        )}
      </ul>
      {localParticipant?.isMuted == false ? (
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
      ) : (
        <p className="mutedMessage">You are muted</p>
      )}

      {selectedMessage && selectedMessage.userId != userId && (
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
