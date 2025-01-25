
import { WebSocketChat } from './ChatBox.tsx';
import { PostMessage, PostUser } from '../utils/PostRequest.tsx';
import { ChatRoomContainer } from '../chatroom/ChatRoomContainer.tsx';
import { useState, useEffect } from 'react';

export const Chat = () => {
    const urlMessages = 'https://localhost:3000/chatMessages';
    // const urlChatRoom = 'https://localhost:3000/chatroom';
    const urlUser = 'https://localhost:3000/users';
    const [localUserId, setLocalUserId] = useState(() => {
        const savedValue = localStorage.getItem("userId");
        return savedValue !== null ? JSON.parse(savedValue) : 1;
    });
    

    useEffect(() => {
        localStorage.setItem('userId', JSON.stringify(localUserId));
        // setLocalUserId(1);
    }, [localUserId]);

    const changeUserId = (e) => {
        e.preventDefault();
        const newUserId = e.target.elements.userId.value;
        setLocalUserId(newUserId);
    };

    return (
        <div>
            <ChatRoomContainer userId={localUserId}/>


            <h1>Post a Message from the contact/guest</h1>
            <PostMessage url={urlMessages} userId={localUserId} chatRoomId={1} /> {}

            <h1>Post a User to the server</h1>
            <PostUser url={urlUser}/>
            
            <form onSubmit={changeUserId}>
                <input
                    type="text"
                    name="userId"
                    value={localUserId}
                    onChange={(e) => setLocalUserId(e.target.value)}
                    placeholder="Enter new user ID"
                    required
                />
                <button type="submit">Change User ID</button>
            </form>
  
            </div>
    );
};


