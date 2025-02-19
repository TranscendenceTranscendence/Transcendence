import React, { useEffect, useState } from "react";
import { User } from "../../generated-api/models";
import { useApi } from "@/utils/api";
import UserAvatar from "./components/UserAvatar";
import UserDetails from "./components/UserDetails";

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    api.Users.usersControllerMe()
      .then((currentUser) => {
        setCurrentUser(currentUser);
        console.log("currentUser:", currentUser);
      })
      .catch((error) => {
        console.error("Failed to fetch user data:", error);
        setError("Failed to fetch user data");
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p>Status: {currentUser.userStatus}</p>
      <UserAvatar user={currentUser} />
      <UserDetails user={currentUser} />
    </div>
  );
}
