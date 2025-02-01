import React from 'react';
import { User } from '../../../generated-api/models';

interface UserDetailsProps {
    user: User;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {

    return (
        <div>
            <div>
                <h2>{user.nickname || 'undefined'}</h2>
                <h3>{user.id || 'undefined'}</h3>
                <h3>Level: {user.ladderLevel}</h3>
            </div>
            <div>
                <p>Email: {user.email || 'undefined'}</p>
                <p>Two factor Authentication: {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
        </div>
    );
};

export default UserDetails;