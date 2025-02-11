import React, { useState } from "react";
import axios from "axios";
import { ChatParticipantChatParticipantRoleEnum } from "@/generated-api/index.ts";

export enum chat_participant_roles {
  Owner = "owner",
  Admin = "admin",
  Guest = "guest",
}

interface PostUserProps {
  url: string;
  userId: number;
}

export const PostUser = ({ url, userId }: PostUserProps) => {
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [response, setResponse] = useState<{ data?: any; error?: any } | null>(
    null
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(url, {
        nickname: name,
        second_auth_email: mail,
      });
      setResponse(res.data);
    } catch (error) {
      console.error("Error:", error);
      if (axios.isAxiosError(error)) {
        setResponse({
          error: error.response
            ? error.response.data
            : "Failed to send message",
        });
      } else {
        setResponse({ error: "Failed to send message" });
      }
      if (axios.isAxiosError(error)) {
        setResponse({
          error: error.response
            ? error.response.data
            : "Failed to send message",
        });
      } else {
        setResponse({ error: "Failed to send message" });
      }
    }
    setName("");
    setMail("");
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        {}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="nickname"
          required
        />
        {}
        <input
          type="text"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          placeholder="mail"
          required
        />
        <button type="submit">Post user</button>
      </form>

      {response && (
        <div>
          <h3>Server Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export const handleSubmitMessages = async (
  url,
  message,
  userId,
  chatRoomId
) => {
  try {
    const res = await axios.post(url, {
      content: message,
      user_id: userId,
      chat_room_id: chatRoomId,
    });
    return res.data;
  } catch (error) {
    console.error("Error:", error);
    if (axios.isAxiosError(error)) {
      return {
        error: error.response ? error.response.data : "Failed to send message",
      };
    } else {
      return { error: "Failed to send message" };
    }
  }
};

interface PostMessageProps {
  url: string;
  userId: number;
  chatRoomId: number;
}

export const PostMessage = ({ url, userId, chatRoomId }: PostMessageProps) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(null);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const res = await handleSubmitMessages(url, message, userId, chatRoomId);
    setResponse(res);
    setMessage("");
  };

  return (
    <div>
      <form onSubmit={handleSubmitForm}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          required
        />
        <button type="submit">Send Message</button>
      </form>

      {response && (
        <div>
          <h3>Server Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export const handleSubmitParticipant = async (url, userId, chatRoomId) => {
  try {
    const res = await axios.post(
      url,
      JSON.stringify({
        user_id: userId,
        chat_room_id: chatRoomId,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error:", error);
    return { error: error, message: "Failed to send message" };
  }
};
