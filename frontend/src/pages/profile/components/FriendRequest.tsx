import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User } from "../../../generated-api/models";
import { SearchUserResponseDto } from "@/generated-api";
import { useApi } from "@/utils/api";

interface FriendRequestProps {
  user: User | SearchUserResponseDto;
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
    if (!user || !user.id) {
      console.error("No valid user provided to FriendRequest component");
      setError("Invalid user data");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching friend status for user:", user.id);
      const response = await api.Friends.friendsControllerGetFriendStatus({
        id: user.id,
      });

      console.log("Friend status response:", response);
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
    if (user && user.id) {
      fetchFriendStatus();
    }
  }, [user?.id]);

  const handleSendRequest = async () => {
    if (!user || !user.id) return;

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

  const buttonClasses = "w-24 justify-center text-nowrap md:w-24";

  if (isLoading) {
    return (
      <Button disabled size="sm" className={buttonClasses}>
        Loading...
      </Button>
    );
  }

  if (error) {
    return (
      <div>
        <p className="text-red-500 text-xs">{error}</p>
        <Button onClick={fetchFriendStatus} size="sm" className={buttonClasses}>
          Retry
        </Button>
      </div>
    );
  }

  // Show different UI based on friendship status
  switch (friendStatus) {
    case "not_friends":
      return (
        <Button onClick={handleSendRequest} className={buttonClasses} size="sm">
          Add Friend
        </Button>
      );
    case "rejected":
      return (
        <Button
          variant="default"
          size="sm"
          className={`bg-red-500 hover:bg-red-500 text-white font-medium ${buttonClasses}`}
          disabled
        >
          Rejected
        </Button>
      );

    case "pending":
      return (
        <Button
          variant="default"
          size="sm"
          className={`bg-orange-500 hover:bg-orange-500 text-white font-medium  ${buttonClasses}`}
          disabled
        >
          Pending
        </Button>
      );

    case "accepted":
      return (
        <Button
          variant="default"
          size="sm"
          className={`bg-green-500 hover:bg-green-500 text-white font-medium ${buttonClasses}`}
          disabled
        >
          Friends
        </Button>
      );

    default:
      return (
        <Button
          variant="default"
          size="sm"
          className={`bg-gray-500 hover:bg-gray-500 text-white font-medium ${buttonClasses}`}
          disabled
        >
          Unknown
        </Button>
      );
  }
};

export default FriendRequest;
