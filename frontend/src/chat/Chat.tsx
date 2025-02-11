import { ChatRoomContainer } from '../chatroom/ChatRoomContainer.tsx';
import { useUserDetails } from './ChatApiCalls.tsx';

export const Chat = () => {
    const { userDetails } = useUserDetails();

    if (!userDetails) {
        return <div>Loading user data...</div>;
    }

    return (
        <div>
            <ChatRoomContainer userDetails={userDetails} />
        </div>
    );
};
