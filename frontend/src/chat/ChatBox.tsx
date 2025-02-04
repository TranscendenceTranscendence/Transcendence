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

export const useChatMessages = (api, chatRoomId) => {
  const [messages, setMessages] = useState<oldMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await api.ChatMessages.chatMessagesControllerFindOne({ id: chatRoomId });
        console.log("Fetched Messages:", response.data);
        setMessages(response.data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (chatRoomId) {
      fetchMessages();
    }
  }, [chatRoomId]);
  console.log("MessagesUseEffect:", messages);
  return { messages, loading, error };
};

export const useParticipants = (api, chatRoomId) => {
  const [Participants, setParticipants] = useState<Participants[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        const response = await api.ChatParticipants.chatParticipantsControllerFindOne({ id: chatRoomId });
        console.log("Fetched Participants:", response.data);
        setParticipants(response.data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (chatRoomId) {
      fetchParticipants();
    }
  }, [chatRoomId]);
  console.log("MessagesUseEffect:", Participants);
  return { Participants, loading, error };
};

export const ChatBox = ({ socket, chatRoomId, userId }) => {
  const api = useApi();
  const { messages: fetchedMessages, loading, error } = useChatMessages(api, chatRoomId);
  const [chatParticipants, setChatParticipants] = useState<Participants[]>([]);
  const { Participants: activeParticipants, loading : error2, error : loading2 } = useParticipants(api, chatRoomId)
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

  const handleAction = (action: string, id: number) => {
    if (action == 'Kick')
      KickUser(chatRoomId, id);
    else if (action == 'Promote')
      PromoteUser({api, chatRoomId, id});
    // else if (action == 'Mute')
    //   MuteUser(userId);
    // else if (action == 'Block')
    //   BlockUser(userId);
    
    console.log(`${action} user with ID: ${id}`);
    setSelectedMessage(null);
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
            console.log("fetched", message);
            return (
              <div
                key={index}
                className={addStyle(message.user_id?.toString() === userId.toString())}
                onClick={(e) => handleMessageClick(e, message.user_id)}
              >
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
  
        {selectedMessage && (
          <div
            className="messagePrompt"
            style={{
              position: 'absolute',
              top: selectedMessage.y,
              left: selectedMessage.x,
              background: 'white',
              border: '1px solid black',
              padding: '10px',
              zIndex: 1000,
            }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <p>Actions for User {selectedMessage.userId}:</p>
            {(localParticipant?.chat_participant_role === chat_participant_roles.Owner || localParticipant?.chat_participant_role === chat_participant_roles.Admin) && (
              <>
                <button onClick={() => handleAction('Kick', selectedMessage.userId)}>Kick</button>
                <button onClick={() => handleAction('Promote', selectedMessage.userId)}>Promote</button>
                <button onClick={() => handleAction('Mute', selectedMessage.userId)}>Mute</button>
              </>
            )}
            <button onClick={() => handleAction('Block', selectedMessage.userId)}>Block</button>
          </div>
        )}
      </div>
    </div>
  );
};
    