import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../../generated-api/models";
import { useApi } from "@/utils/api";
import UserDetails from "./components/UserDetails";
import FriendRequest from "./components/FriendRequest";
import AvatarDisplay from "../updateUser/components/AvatarDisplay";
import { jwtDecode } from "jwt-decode";
import { Achievement } from "@/generated-api";
import { AchievementBox } from "../home/components/AchievementsBox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const [achievements, setAchievements] = useState<Achievement[]>([]);

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
    const fetchAchievements = async () => {
      try {
        const userId = visitingUser?.id;
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
    Promise.all([fetchAchievements()]);
  }, [id, navigate, api.Users]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!visitingUser) {
    return <div>Loading...</div>;
  }

  // Determine the status color
  const statusColor = (() => {
    switch (visitingUser.userStatus) {
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
    <div className="flex flex-row justify-center items-center min-h-screen">
      <Card>
        <CardContent className="flex items-start bg-gray-50/50">
          <div className="flex flex-col">
            <div
              style={{ maxWidth: "500px", maxHeight: "500px", margin: "50px" }}
            >
              <AvatarDisplay user={visitingUser} />
            </div>
          </div>
          <div className="flex flex-col pr-[50px] pt-[50px]">
            <div className="flex flex-col items-end gap-2 justify-end">
              <div>
                <FriendRequest user={visitingUser} />
              </div>
              <div className="flex items-end gap-2">
                <div className={`w-6 h-6 rounded-full ${statusColor}`}></div>
                <h3 className="text-xl font-semibold text-right align-bottom">
                  {visitingUser.userStatus}
                </h3>
              </div>
            </div>
            <br />
            <UserDetails user={visitingUser} />
            <div className="pt-8">
              <AchievementBox achievements={achievements} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
