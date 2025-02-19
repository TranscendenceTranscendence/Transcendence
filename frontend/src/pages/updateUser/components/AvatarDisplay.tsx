import * as React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useConfig } from "../../../utils/config";

interface AvatarProps {
  avatarUrl?: string;
  className?: string;
  isActive?: boolean;
}

export default function AvatarDisplay({
  avatarUrl,
  className,
  isActive,
}: AvatarProps) {
  const config = useConfig();

  return (
    <Avatar
      className={
        "w-full h-auto aspect-square" + (className ? " " + className : "")
      }
      isActive={isActive}
    >
      <AvatarImage src={config.backendUrl + avatarUrl} alt="User Avatar" />
    </Avatar>
  );
}
