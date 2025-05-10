import { useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConfig } from "../../../utils/config";
import { type User, UserUserStatusEnum } from "@/generated-api";
import { cn } from "@/lib/utils";
import { useUser } from "@/utils/providers/UserProvider";

interface AvatarProps {
  className?: string;
  user?: User;
  avatarUrl?: string;
}

export default function AvatarDisplay({
  className,
  user,
  avatarUrl,
}: AvatarProps) {
  const config = useConfig();
  const me = useUser();
  const statusStyles = {
    [UserUserStatusEnum.Online]: "ring ring-green-600 ring-offset-2",
    [UserUserStatusEnum.Offline]: "ring ring-muted",
  };

  const userStatus = useMemo(() => {
    if (!user) return null;
    return (
      me.subscribedToUsersSet.find((u) => u.id === user.id)?.status ??
      user.userStatus
    );
  }, [me.subscribedToUsersSet, user]);

  useEffect(() => {
    if (!user) return;
    me.subscribeToUser(user.id);
  }, [me.user?.id, user?.id]);

  if (avatarUrl) {
    console.log("Avatar URL:", avatarUrl);

    return (
      <Avatar
        className={cn(
          " h-auto aspect-square",
          className ? " " + className : "",
        )}
      >
        <AvatarImage
          src={
            avatarUrl.includes("http")
              ? avatarUrl
              : config.backendUrl + avatarUrl
          }
          alt="User Avatar"
        />
        <AvatarFallback>:(</AvatarFallback>
      </Avatar>
    );
  }

  if (!me.user || !user) {
    return "Loading...";
  }

  return (
    <Avatar
      className={cn(
        " h-auto aspect-square",
        className ? " " + className : "",
        userStatus ? statusStyles[userStatus] : "",
      )}
    >
      <AvatarImage
        src={
          user.avatar.includes("http")
            ? user.avatar
            : config.backendUrl + user.avatar
        }
        alt="User Avatar"
      />
    </Avatar>
  );
}
