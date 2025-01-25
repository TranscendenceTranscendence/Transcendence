import React from 'react';
import { useEffect, useState } from 'react';
import { useFetchRequest, useFetchRequestMount } from '../utils/FetchRequest.tsx';
import { handleSubmitMessages } from '../utils/PostRequest.tsx';
import { ChatNode } from './ChatNode.tsx';
import { KickUser, PromoteUser, MuteUser, BlockUser } from './ChatActions.tsx';
import { useApi } from '../utils/api/index.ts';

interface oldMessage {
  content: string;
  user_id: number;
}

enum chat_participant_roles {
  Owner = "owner",
  Admin = "admin",
  Guest = "guest"
}

interface Participants {
  user_id: number | null;
  chat_room_id: number | null;
  chat_participant_role: chat_participant_roles;
}

const addStyle = (value: boolean) => {
  return value ? 'chatUser' : 'chatContact';
};

export const ChatBox = ({ socket, chatRoomId, userId }) => {
  const api = useApi();
  const url = `https://localhost:3000/chatMessages/${chatRoomId}`;
  const { data: fetchedMessages, error, loading } = useFetchRequest<oldMessage[]>(url);
  const [chatParticipants, setChatParticipants] = useState<Participants[]>([]);
  const { data: activeParticipants, error2, loading2 } = useFetchRequestMount<Participants[]>(`https://localhost:3000/chatParticipants/${chatRoomId}/find/`);
  const localParticipant = activeParticipants?.find((participant) => participant.user_id?.toString() === userId.toString());
  const [messages, setMessages] = useState<oldMessage[]>(fetchedMessages || []);
  const [input, setInput] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<{
    userId: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    api.ChatParticipants.chatParticipantsControllerFindParticipantByChatRoom({
      chatRoomId: chatRoomId,
    }).then((response) => {
      console.log('Chat Participants:', response);
      // setChatParticipants(response.data);
    })
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  useEffect(() => {
    console.log("Active Participants:", activeParticipants);
  }, [activeParticipants]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    const handleReceiveMessage = (message) => {
      console.log('Messages -->', messages);
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = { content: input, user_id: userId, user: localParticipant };
      socket.emit('sendMessage', newMessage);
      handleSubmitMessages('https://localhost:3000/chatMessages', input, userId, chatRoomId);
      setInput('');
    }
  };

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

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  if (loading) {
    return <div>Loading messages...</div>;
  }

  if (error) {
    return <div>Error loading messages: {error.message}</div>;
  }

  return (
    <div>
      <ul className='chatMessages'>
        {Array.isArray(messages) ? (
          messages.map((message, index) => {
            const user = activeParticipants?.find((participant) => participant.user_id === message.user_id);
            // console.log(`Message user_id: ${message.user_id}, Found user:`, user);
            console.log("fetched", message)
            return (
              <div key={index} className={addStyle(message.user_id?.toString() === userId.toString())} onClick={(e) => handleMessageClick(e, message.user_id)}>
                <ChatNode key={index} message={message} user={user} loading={loading2} userId={userId} />
              </div>
            );
          })
        ) : (
          <p>No messages found.</p>
        )}
      </ul>
      <div className='formMessages'>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};