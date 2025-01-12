import * as React from 'react';

import { Avatar } from '@mui/material';
import { useConfig } from '../../../utils/config';


interface AvatarProps {
  avatarUrl?: string;
}

export default function AvatarDisplay({ avatarUrl }: AvatarProps) {
  const config = useConfig()
  console.log('AvatarDisplay config:', config.backendUrl);
  console.log('AvatarDisplay avatarUrl:', avatarUrl);
  console.log(config.backendUrl + avatarUrl);
  return (
    <React.Fragment>
      <Avatar
        alt="Remy Sharp"
        src={config.backendUrl + avatarUrl}
        sx={{ width: "100%", height: "auto", aspectRatio: "1" }}

      />
    </React.Fragment>
  );
}
