import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../../generated-api/models";
import { useApi } from "@/utils/api";
import UserDetails from "./components/UserDetails";
import FriendRequest from "./components/FriendRequest";
import AvatarDisplay from "../updateUser/components/AvatarDisplay";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: number;
  email: string;
}

export default function VisitingProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visitingUser, setVisitingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    const userIdNumber = Number(id);
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Not authenticated");
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentUserId = decoded.sub;

      if (currentUserId === userIdNumber) {
        console.log("Visiting own profile, send back to /profile");
        navigate("/profile");
        return;
      }

      if (id && isNaN(userIdNumber)) {
        setError("Invalid user ID");
        return;
      }

      api.Users.usersControllerFindOne({ id: userIdNumber })
        .then((visitingUser) => {
          setVisitingUser(visitingUser);
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
          setError("Invalid user ID");
        });
    } catch (error) {
      console.error("Failed to decode token:", error);
      setError("Authentication error");
    }
  }, [id, navigate, api.Users]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!visitingUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p>Status: {visitingUser.userStatus}</p>
      <div style={{ maxWidth: "300px", maxHeight: "300px" }}>
        <AvatarDisplay user={visitingUser} />
      </div>
      <UserDetails user={visitingUser} />
      <FriendRequest user={visitingUser} />
    </div>
  );
}
