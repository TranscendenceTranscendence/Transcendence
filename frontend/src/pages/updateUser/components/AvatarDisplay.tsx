import { useEffect, useMemo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
    // if (!user || !me.user) return;

    me.subscribeToUser(user.id);
  }, [me.user?.id, user?.id]);

  if (avatarUrl) {
    return (
      <Avatar
        className={cn(
          "w-full h-auto aspect-square",
          className ? " " + className : "",
        )}
      >
        <AvatarImage src={config.backendUrl + avatarUrl} alt="User Avatar" />
      </Avatar>
    );
  }

  if (!me.user || !user) {
    return "Loading...";
  }

  return (
    <Avatar
      className={cn(
        "w-full h-auto aspect-square",
        className ? " " + className : "",
        userStatus ? statusStyles[userStatus] : "",
      )}
    >
      <AvatarImage src={config.backendUrl + user.avatar} alt="User Avatar" />
    </Avatar>
  );
}
