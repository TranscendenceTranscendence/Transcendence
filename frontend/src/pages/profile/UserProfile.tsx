import React, { useEffect, useRef, useState } from "react";
import { User } from "../../generated-api/models";
import { useApi } from "@/utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  // Determine the status color
  const statusColor = (() => {
    switch (currentUser.userStatus) {
      case "online":
        return "bg-emerald-500";
      case "offline":
        return "bg-gray-500";
      case "waiting":
        return "bg-yellow-500";
      case "playing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  })();

  return (
    <div className="flex flex-column justify-center items-center min-h-screen">
      <Card>
        <CardContent className="flex items-start bg-gray-50/50">
          <div
            style={{ maxWidth: "500px", maxHeight: "500px", margin: "50px" }}
          >
            <AvatarDisplay user={currentUser} />
          </div>
          <div className="flex flex-col pr-[50px] pt-[50px]">
            <div className="flex items-end gap-2 justify-end">
              <div className={`w-6 h-6 rounded-full ${statusColor}`}></div>
              <h3 className="text-xl font-semibold text-right align-bottom">
                {currentUser.userStatus}
              </h3>
            </div>
            <br />
            <br />
            <UserDetails user={currentUser} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
