import { useEffect, useState } from 'react';
import { useFetchRequest, useFetchRequestDep, useFetchRequestMount} from '../utils/FetchRequest.tsx';
import { handleSubmitMessages } from '../utils/PostRequest.tsx';
import { ChatNode } from './ChatNode.tsx';
import React from 'react';
import { KickUser, PromoteUser, MuteUser, BlockUser } from './ChatActions.tsx';

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
  user_id : number | null;
  chat_room_id : number | null;
  chat_participant_role : chat_participant_roles
}

enum chat_room_types {
  Public = "public",
  Protected = "protected",
  Private = "private"
}

interface ChatRoom {
  title: string;
  id: number;
  chat_room_type: chat_room_types;
  password: string;
  chatParticipants: Participants[];
}

const addStyle = ( value : boolean ) => {

  return (value == true ? 'chatUser' : 'chatContact');
}

export const ChatBox = ({ socket, chatRoomId, userId }) => {
  const url = `https://localhost:3000/chatMessages/${chatRoomId}`;
  const { data: fetchedMessages, error, loading } = useFetchRequest<oldMessage[]>(url);
  const { data: activeParticipants, error2, loading2 } = useFetchRequestMount<Participants[]>(`https://localhost:3000/chatParticipants/${chatRoomId}/find/`)
  const localParticipant = activeParticipants?.find((participant) => participant.user_id?.toString() == userId.toString());
  const [messages, setMessages] = useState<oldMessage[]>(fetchedMessages || []); 
  const [input, setInput] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<{
    userId: number;
    x: number;
    y: number;
  } | null>(null);

  console.log(localParticipant);
  console.log(userId)
  useEffect(() => {
    api.ChatParticipants.chatParticipantsControllerFindParticipantByChatRoom({
      chatRoomId: chatRoomId,api
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
      PromoteUser(chatRoomId, id);
    // else if (action == 'Mute')
    //   MuteUser(userId);
    // else if (action == 'Block')
    //   BlockUser(userId);
    
    useEffect(() => {
      socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      const handleReceiveMessage = (message) => {
        console.log("!!!!!!!!!!!!");
        setMessages((prevMessages) => [...prevMessages, message]);
      };
      
      socket.on('receiveMessage', handleReceiveMessage); 
      return () => {
        socket.off('receiveMessage');
      };
    }, []);
    
    const handleSendMessage = () => {
      if (input.trim()) {
        const newMessage = { content: input, user_id: userId.userId };
        socket.emit('sendMessage', newMessage);
        handleSubmitMessages('https://localhost:3000/chatMessages', input, userId, chatRoomId);
        setInput('');
      }
    };
    useEffect(() => {
      window.addEventListener('click', handleOutsideClick);
      return () => {
        window.removeEventListener('click', handleOutsideClick);
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
      if (action == 'Kick')
        KickUser(chatRoomId, id);
      else if (action == 'Promote')
        PromoteUser(chatRoomId, id);
      // else if (action == 'Mute')
      //   MuteUser(userId);
      // else if (action == 'Block')
      //   BlockUser(userId);
      
      console.log(`${action} user with ID: ${id}`);
      setSelectedMessage(null);
    };

    if (loading) {
      return <div>Loading messages...</div>;
    }

    if (error) {
      return <div>Error loading messages: {error.message}</div>;
    }
    
    // if (!chatRoomId)
    //     return <p>fout</p>;
    console.log("local participant -> " , localParticipant);
    return (
      <div>
          <ul className='chatMessages'>
              {Array.isArray(messages) ? (
                  messages.map((message, index) => (
                    <div key={index} className={addStyle(message.user_id?.toString() === userId.toString())} onClick={(e) => handleMessageClick(e, message.user_id)}>
                        <ChatNode key={index} message={message} user={activeParticipants?.filter((participant) => participant.user_id == message.user_id)} loading={loading2} userId={userId}/>
                          
                    </div>
                  ))
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
          onClick={(e) => e.stopPropagation()}
        >
          <p>Actions for User {selectedMessage.userId}:</p>
          {((localParticipant?.chat_participant_role == chat_participant_roles.Owner) || (localParticipant?.chat_participant_role == chat_participant_roles.Admin)) && <button onClick={() => handleAction('Kick', selectedMessage.userId)}>Kick</button>}
          {((localParticipant?.chat_participant_role == chat_participant_roles.Owner) || (localParticipant?.chat_participant_role == chat_participant_roles.Admin)) && <button onClick={() => handleAction('Promote', selectedMessage.userId)}>Promote</button>}
          {((localParticipant?.chat_participant_role == chat_participant_roles.Owner) || (localParticipant?.chat_participant_role == chat_participant_roles.Admin)) && <button onClick={() => handleAction('Mute', selectedMessage.userId)}>Mute</button>}
          <button onClick={() => handleAction('Block', selectedMessage.userId)}>Block</button>
        </div>
      )}
    </div>
    );
  };
  
  
  