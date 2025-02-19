import * as React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useConfig } from "../../../utils/config";
import { UserUserStatusEnum } from "@/generated-api";
import { cn } from "@/lib/utils";

interface AvatarProps {
  avatarUrl?: string;
  className?: string;
  status?: UserUserStatusEnum;
}

export default function AvatarDisplay({
  avatarUrl,
  className,
  status,
}: AvatarProps) {
  const config = useConfig();
  const statusStyles = {
    [UserUserStatusEnum.Online]: "ring ring-green-600 ring-offset-2",
    [UserUserStatusEnum.Offline]: "ring ring-muted",
  };

  return (
    <Avatar
      className={cn(
        "w-full h-auto aspect-square",
        className ? " " + className : "",
        status ? statusStyles[status] : "",
      )}
    >
      <AvatarImage src={config.backendUrl + avatarUrl} alt="User Avatar" />
    </Avatar>
  );
}
