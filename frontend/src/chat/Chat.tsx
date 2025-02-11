import { PostMessage, PostUser } from '../utils/PostRequest.tsx';
import { ChatRoomContainer } from '../chatroom/ChatRoomContainer.tsx';
import { useState, useEffect } from 'react';
import { MeResponseSuccess } from '@/generated-api/index.ts';
import { useApi } from '@/utils/api/index.ts';

export const Chat = () => {
    const [userDetails, setUserDetails] = useState<MeResponseSuccess | null>(null);
    const api = useApi();    

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userDetails: MeResponseSuccess = await api.Users.usersControllerMe();
                console.log("User details:", userDetails);
                if (userDetails?.id) {
                    setUserDetails(userDetails);
                    localStorage.setItem('localUserId', JSON.stringify(userDetails.id));
                }
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        };

        fetchUserDetails();
    }, []);

    if (!userDetails) {
        return <div>Loading user data...</div>;
    }

    return (
        <div>
            <ChatRoomContainer userDetails={userDetails} />
        </div>
    );
};
