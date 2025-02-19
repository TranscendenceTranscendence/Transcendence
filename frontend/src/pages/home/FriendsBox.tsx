import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Friend } from "@/generated-api";
import { useConfig } from "@/utils/config";
import { useUser } from "@/utils/providers/UserProvider";
import AvatarDisplay from "../updateUser/components/AvatarDisplay";

interface FriendBoxProps {
  friends: Friend[];
}

export const FriendsBox = ({ friends }: FriendBoxProps) => {
  const me = useUser();
  const config = useConfig();

  return (
    <div className="row-span-3 w-full">
      <Card className="">
        <CardHeader>
          <p className="font-bold text-3xl">FRIENDS</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {friends.map(({ receiver, sender }) => {
              const friend = receiver.id == me.user.id ? sender : receiver;
              return (
                <div key={friend.id} className="flex items-center gap-4 ">
                  <AvatarDisplay avatarUrl={friend.avatar} className="w-14" />
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
