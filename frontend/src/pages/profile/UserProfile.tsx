import React, { useEffect, useRef, useState } from "react";
import { User } from "../../generated-api/models";
import { useApi } from "@/utils/api";
import UserDetails from "./components/UserDetails";
import AvatarDisplay from "../updateUser/components/AvatarDisplay";

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const apiUsersRef = useRef(api.Users);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!apiUsersRef.current?.usersControllerMe) {
        setError("API not available");
        return;
      }

      try {
        const user = await apiUsersRef.current.usersControllerMe();
        setCurrentUser(user);
        console.log("currentUser:", user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to fetch user data");
      }
    };

    fetchUserData();
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
      <div style={{ maxWidth: "300px", maxHeight: "300px" }}>
        <AvatarDisplay avatarUrl={currentUser.avatar} />
      </div>
      <UserDetails user={currentUser} />
    </div>
  );
}
