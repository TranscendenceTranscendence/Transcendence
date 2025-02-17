import { useState, useEffect } from "react";
import { useApi } from '@/utils/api/index.ts';
import { ChatParticipantChatParticipantRoleEnum, ChatRoomsControllerCreateRequest, CreateChatRoomDtoChatRoomTypeEnum } from '@/generated-api/index.ts';

export const PostChatRoom = ( userId ) => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [response, setResponse] = useState<{ data?: any; error?: any } | null>(
      null
    );
    const [type, setType] = useState<CreateChatRoomDtoChatRoomTypeEnum>("public");
    const api = useApi();

    const addChatRoom = async () => {
        try {
            const chatRoomData: ChatRoomsControllerCreateRequest = {
                createChatRoomDto: {
                    title: name,
                    password: password || "",
                    creationDate: new Date(),
                    chatRoomType: type,
                    userId: userId.userId,
                    role: ChatParticipantChatParticipantRoleEnum.Owner,
                }
            };
            console.log("Chat Room Data:", chatRoomData);

            const res = await api.ChatRooms.chatRoomsControllerCreate(chatRoomData);
            console.log("Chat Room Created:", res);
            setResponse({ data: res });
        } catch (error) {
            console.error("Error creating chat room:", error);
            setResponse({ error });
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        addChatRoom();
        setName("");
        setPassword("");
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