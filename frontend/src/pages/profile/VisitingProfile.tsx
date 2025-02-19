import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../../generated-api/models";
import { useApi } from "@/utils/api";
import UserAvatar from "./components/UserAvatar";
import UserDetails from "./components/UserDetails";
import FriendRequest from "./components/FriendRequest";
import InviteToGame from "./components/InviteToGame";

export default function VisitingProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [visitingUser, setVisitingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    const userIdNumber = Number(id);

    api.Users.usersControllerMe()
      .then((currentUser) => {
        setCurrentUser(currentUser);
        console.log("currentUser:", currentUser);
      })
      .catch((error) => {
        console.error("Can't get current user from cookies", error);
      });

    if (id && isNaN(userIdNumber)) {
      setError("Invalid user ID");
      return;
    }
    api.Users.usersControllerFindOne({ id: userIdNumber })
      .then((visitingUser) => {
        setVisitingUser(visitingUser);
        console.log("visitingUser:", visitingUser);
      })
      .catch((error) => {
        console.error("Failed to fetch user data:", error);
        setError("Invalid user ID");
      });
  }, [id, api.Users]);

  useEffect(() => {
    if (currentUser && visitingUser && currentUser.id === visitingUser.id) {
      console.log(
        "currentUser is equal to visitingUser, navigating to /profile",
      );
      navigate("/profile");
    }
  }, [currentUser, visitingUser]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentUser || !visitingUser) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>User Profile</h1>
      <p>Status: {visitingUser.userStatus}</p>
      <UserAvatar user={visitingUser} />
      <UserDetails user={visitingUser} />
      <FriendRequest user={visitingUser} />
      {/* <InviteToGame user={visitingUser} /> */}
    </div>
  );
}
