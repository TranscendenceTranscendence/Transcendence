import React from "react";
import { User } from "../../../generated-api/models";

interface UserDetailsProps {
  user: User;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  return (
    <div>
      <div className="text-xl font-semibold gap-y-4">
        <h2 className="text-7xl font-extrabold">{user.nickname}</h2>
        <hr className="my-4 border-t-2 border-gray-300" />
        <h3>{user.id}</h3>
        <h3>Level {user.ladderLevel}</h3>
      </div>
      <div className="text-xl font-normal gap-y-4">
        <p>{user.email}</p>
        <p>2FA {user.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
      </div>
    </div>
  );
};

export default UserDetails;
