import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User } from "../../../generated-api/models";
import { useApi } from "@/utils/api";

interface FriendRequestProps {
  user: User;
}

interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  message: string;
}

const FriendRequest: React.FC<FriendRequestProps> = ({ user }) => {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);

  const fetchFriendStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.Friends.friendsControllerGetFriendStatus({
        id: user.id,
      });

      // Debugging: Friend status response can be logged here in development mode if needed.
      if (response.friendStatus) {
        setFriendStatus(response.friendStatus);
      }
    } catch (err) {
      console.error("Failed to get friend status:", err);
      setError("Failed to check friendship status");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch friend status when component mounts or user changes
  useEffect(() => {
    fetchFriendStatus();
  }, [user.id]);

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.Friends.friendsControllerSendFriendRequest({ id: user.id });
      // After sending request, refresh the status
      await fetchFriendStatus();
    } catch (err: unknown) {
      console.error("Failed to send friend request:", err);
      const error = err as ApiError;
      if (error.response?.status === 409) {
        // Conflict error - refresh the status
        await fetchFriendStatus();
      } else {
        setError("Failed to send friend request");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

  if (error) {
    return (
      <div>
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchFriendStatus}>Retry</Button>
      </div>
    );
  }

  // Show different UI based on friendship status
  switch (friendStatus) {
    case "not_friends":
      return (
        <Button onClick={handleSendRequest} className="bg-blue-500 text-white">
          Add Friend
        </Button>
      );
    case "rejected":
      return <div className="text-red-500">Rejected</div>;

    case "pending":
      return <div className="text-orange-500">Pending</div>;

    case "accepted":
      return <div className="text-green-500">✓ Friends</div>;

    default:
      return <div>Unknown Status</div>;
  }
};

export default FriendRequest;
