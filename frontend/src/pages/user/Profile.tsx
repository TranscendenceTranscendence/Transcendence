import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "../../generated-api";
import { useConfig } from "@/utils/config";
import { useApi } from "@/utils/api";
import { set } from "date-fns";

// interface User {
//   nickname: string;
//   avatar: string;
//   email: string;
//   two_factor_enabled: boolean;
//   ladder_level: number;
//   user_status: string;
// }

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const config = useConfig();
  const api = useApi();

  useEffect(() => {
    const userIdNumber = Number(id);
    if (isNaN(userIdNumber)) {
      setError("Invalid user ID");
      return;
    }
    // Fetch user data from the backend
    api.Users.usersControllerFindOne({ id: userIdNumber })
      .then((user) => {
        setUser(user);
        setAvatarUrl(config.backendUrl + user.avatar);
        console.log("user:", user);
      })
      .catch((error) => {
        console.error("Failed to fetch user data:", error);
        setError("Failed to fetch user data");
      });
  }, [api.Users, config.backendUrl, id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Status: {user.userStatus}</p>
      <div>
        <img
          src={avatarUrl}
          alt="User AvatarDisplay"
          style={{ width: "100px", height: "140px", borderRadius: "10%" }}
        />
      </div>
      <div>
        <h2>{user.nickname || "undefined"}</h2>
        <h3>Level: {user.ladderLevel}</h3>
      </div>
      <div>
        <p>Email: {user.email || "undefined"}</p>
        <p>
          Two factor Authentication:{" "}
          {user.twoFactorEnabled ? "Enabled" : "Disabled"}
        </p>
      </div>
    </div>
  );
}
