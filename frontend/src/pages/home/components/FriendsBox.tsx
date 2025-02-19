import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Friend, UserUserStatusEnum } from "@/generated-api";
import { useConfig } from "@/utils/config";
import { useUser } from "@/utils/providers/UserProvider";
import AvatarDisplay from "../../updateUser/components/AvatarDisplay";
import { useNavigate } from "react-router-dom";

interface FriendBoxProps {
  friends: Friend[];
}

export const FriendsBox = ({ friends }: FriendBoxProps) => {
  const me = useUser();
  const navigate = useNavigate();

  return (
    <div className="row-span-3 w-full">
      <Card>
        <CardHeader>
          <p className="font-bold text-3xl">FRIENDS</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {friends.map(({ receiver, sender }) => {
              const friend = receiver.id == me.user?.id ? sender : receiver;
              return (
                <div
                  key={friend.id}
                  className="flex items-center gap-4 hover:bg-gray-100 p-4 rounded-lg cursor-pointer"
                  onClick={() => {
                    navigate(`/profile/${friend.id}`);
                  }}
                >
                  <AvatarDisplay
                    avatarUrl={friend.avatar}
                    className="w-14"
                    status={friend.userStatus}
                  />
                  <div>
                    <p className="font-bold text-xl">{friend.nickname}</p>
                    <p className="text-lg text-gray-600">
                      Level {friend.ladderLevel}
                    </p>
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
