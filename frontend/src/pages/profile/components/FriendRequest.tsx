import React, { useState } from 'react';
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

    const handleSendRequest = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Check if token exists
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            await api.Friends.friendsControllerSendFriendRequest({ id: user.id });
            console.log('Friend request sent successfully');
        } catch (err) {
            console.error('Failed to send friend request:', err);
            if (err.response?.status === 401) {
                // Handle unauthorized error - maybe redirect to login
                // window.location.href = '/login';
                console.log("Unauthorized");
            }
            setError('Failed to send friend request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Button onClick={handleSendRequest} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Friend Request'}
            </Button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
};

export default FriendRequest;