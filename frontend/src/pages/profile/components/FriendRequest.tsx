import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { User } from "../../../generated-api/models";
import { useApi } from '@/utils/api';

interface FriendRequestProps {
  user: User;
}

const FriendRequest: React.FC<FriendRequestProps> = ({ user }) => {
    const api = useApi();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buttonText, setButtonText] = useState<string>('Send Friend Request');

    // useEffect(() => {
        // const checkIfFriendRequestSent = async () => {
        //     try {
        //         const token = localStorage.getItem('access_token');
        //         if (!token) {
        //             throw new Error('No authentication token found');
        //         }

        //         const response = await api.Friends.friendsControllerGetFriendRequestsRaw();
        //         const friendRequests = await response.value();

        //         if (friendRequests && friendRequests.data) {
        //             const friendRequestExists = friendRequests.data.some((request: any) => 
        //                 request.sender?.id === user.id || request.receiver?.id === user.id
        //             );
                    
        //             if (friendRequestExists) {
        //                 setButtonText('Friend Request Sent');
        //             }
        //         }
        //     } catch (err: any) {
        //         console.error('Failed to check if friend request sent:', err);
        //         setError('Failed to check friend request status');
        //     }
        // };

    //     checkIfFriendRequestSent();
    // }, [api, user.id]);

    const handleSendRequest = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await api.Friends.friendsControllerSendFriendRequest({ id: user.id });
            setButtonText('Friend Request Sent');
        } catch (err: any) {
            console.error('Failed to send friend request:', err);
            if (err.response?.status === 409) {
                setButtonText('Already Friends');
            } else {
                setError('Failed to send friend request');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Button 
                onClick={handleSendRequest} 
                disabled={isLoading || buttonText === 'Friend Request Sent' || buttonText === 'Already Friends'}
            >
                {buttonText}
            </Button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
};

export default FriendRequest;