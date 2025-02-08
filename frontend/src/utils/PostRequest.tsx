import React, { useState } from "react";
import axios from "axios";

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

interface PostChatRoomProps {
  url: string;
  userId: number;
  role: chat_participant_roles;
}

export const PostChatRoom = ({ url, userId, role }: PostChatRoomProps) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState<{ data?: any; error?: any } | null>(
    null
  );
  const [type, setType] = useState("");
  const [refetch, setRefetch] = useState<boolean>(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(name);
    console.log(password);

    try {
      const res = await axios.post(url, {
        title: name,
        password: password,
        chat_room_type: type,
        user_id: userId,
        role: role,
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
    }

    // Clear the inputs after submission
    setName("");
    setPassword("");
    setRefetch(true);
  };

  return (
    <div>
      <p>Add Chatroom</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add title"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Add password (optional)"
        />

        <div>
          <p>Select chat type:</p>
          <div>
            <input
              type="radio"
              id="public"
              name="chatType"
              value="public"
              checked={type === "public"}
              onChange={(e) => setType(e.target.value)}
            />
            <label htmlFor="public">Public</label>
          </div>

          <div>
            <input
              type="radio"
              id="protected"
              name="type"
              value="protected"
              checked={type === "protected"}
              onChange={(e) => setType(e.target.value)}
            />
            <label htmlFor="protected">Protected</label>
          </div>

          <div>
            <input
              type="radio"
              id="private"
              name="type"
              value="private"
              checked={type === "private"}
              onChange={(e) => setType(e.target.value)}
            />
            <label htmlFor="private">Private</label>
          </div>
        </div>

        <button type="submit">Send chatroom</button>
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
