import { Friend } from "@/generated-api";
import { useConfig } from "@/utils/config";
import { useUser } from "@/utils/providers/UserProvider";

interface FriendBoxProps {
  friends: Friend[];
}

export const FriendsBox = ({ friends }: FriendBoxProps) => {
  const me = useUser();
  const config = useConfig();

  return (
    <div className="row-span-3 w-full rounded-xl bg-gray-200 ...">
      <p className="font-bold text-3xl m-8">FRIENDS</p>
      <div className="grid grid-cols-3 gap-4">
        {friends.map(({ receiver, sender }) => {
          const friend = receiver.id == me.user.id ? sender : receiver;
          return (
            // TODO(Daan): style this
            <div key={friend.id} className="flex flex-col items-center gap-2">
              <p className="font-bold text-xl">{friend.nickname}</p>
              <p className="font-bold text-lg">Level {friend.ladderLevel}</p>
              <img
                src={config.backendUrl + friend.avatar}
                alt={friend.nickname}
                className="w-24 h-24 rounded-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
