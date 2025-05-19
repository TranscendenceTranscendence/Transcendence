import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Friend } from "@/generated-api";
import { useUser } from "@/utils/providers/UserProvider";
import AvatarDisplay from "../../updateUser/components/AvatarDisplay";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApi } from "@/utils/api";
import { Button } from "@/components/ui/button";

export const FriendRequestsBox = () => {
  const me = useUser();
  const navigate = useNavigate();
  const api = useApi();

  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await api.Friends.friendsControllerGetFriendRequests();
        setFriendRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
      }
    };
    fetchFriendRequests();
  }, [me.user]);

  const acceptFriendRequest = async (friendId: number) => {
    try {
      await api.Friends.friendsControllerAcceptFriendRequest({
        id: friendId,
      });
      setFriendRequests((prev) =>
        prev.filter((request) => request.sender.id !== friendId),
      );
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  return (
    <div className="row-span-3 w-full">
      <Card>
        <CardHeader>
          <p className="font-bold text-3xl">FRIEND REQUESTS</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {friendRequests.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">No friend requests</p>
              </div>
            )}
            {friendRequests.map(({ sender }) => {
              const friend = sender;
              return (
                <div
                  key={friend.id}
                  className="flex items-center gap-4 hover:bg-gray-100 p-4 rounded-lg cursor-pointer"
                  onClick={() => {
                    navigate(`/profile/${friend.id}`);
                  }}
                >
                  <AvatarDisplay user={friend} className="w-14" />
                  <div>
                    <p className="font-bold text-xl">{friend.nickname}</p>
                    <p className="text-lg text-gray-600">Elo: {friend.elo}</p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptFriendRequest(friend.id);
                      }}
                      className="mt-2"
                      variant="secondary"
                      size="sm"
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
