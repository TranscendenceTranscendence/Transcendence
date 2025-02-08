import * as React from 'react';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useConfig } from '../../../utils/config';

interface AvatarProps {
  avatarUrl?: string;
}

export default function AvatarDisplay({ avatarUrl }: AvatarProps) {
  const config = useConfig();
  console.log('AvatarDisplay config:', config.backendUrl);
  console.log('AvatarDisplay avatarUrl:', avatarUrl);
  console.log(config.backendUrl + avatarUrl);
  
  return (
    <Avatar className="w-full h-auto aspect-square">
      <AvatarImage src={config.backendUrl + avatarUrl} alt="User Avatar" />
    </Avatar>
  );
}
