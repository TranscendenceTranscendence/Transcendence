import React from 'react';
import { User } from '../../../generated-api/models';
import { useConfig } from '@/utils/config';

interface UserAvatarProps {
  user: User;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
    const config = useConfig();
  
  return (
    <div className="user-avatar" style={{ width: '300px', height: '300px' }}>
      <img src={config.backendUrl + user.avatar} alt={`${user.nickname}'s avatar`} style={{ width: '100%', height: '100%' }} />
      <p>{user.nickname}</p>
    </div>
  );
};

export default UserAvatar;