import React, { useEffect, useRef, useState } from "react";
import { User } from "../../generated-api/models";
import { useApi } from "@/utils/api";
import { Achievement } from "@/generated-api";
import { Card, CardContent } from "@/components/ui/card";
import UserDetails from "./components/UserDetails";
import AvatarDisplay from "../updateUser/components/AvatarDisplay";
import { AchievementBox } from "../home/components/AchievementsBox";
import { useUser } from "@/utils/providers/UserProvider";

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const me = useUser();
  const apiUsersRef = useRef(api.Users);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!apiUsersRef.current?.usersControllerMe) {
        setError("API not available");
        return;
      }

      try {
        const user = await apiUsersRef.current.usersControllerMe();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to fetch user data");
      }
    };
    const fetchAchievements = async () => {
      try {
        const userId = me.user?.id;
        if (!userId) return;
        const response =
          await api.Achievements.achievementsControllerFindAllbyUserId({
            userId,
          });
        setAchievements(response.achievements);
      } catch (error) {
        console.error("Failed to fetch achievements list:", error);
      }
    };

    fetchUserData();
    Promise.all([fetchAchievements()]);
  }, [me.user]);

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
            <UserDetails user={currentUser} />
            <div className="pt-8">
              <AchievementBox achievements={achievements} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
