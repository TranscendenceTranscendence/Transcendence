import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../../generated-api/models";
import { useApi } from "@/utils/api";
import UserDetails from "./components/UserDetails";
import FriendRequest from "./components/FriendRequest";
import AvatarDisplay from "../updateUser/components/AvatarDisplay";
import { Achievement } from "@/generated-api";
import { AchievementBox } from "../home/components/AchievementsBox";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/utils/providers/UserProvider";
import { Button } from "@/components/ui/button";
import { useChat } from "@/utils/providers/ChatProvider";
import { postDmChatRoom } from "../../chat/ChatApiCalls";

export default function VisitingProfile() {
  const { id } = useParams<{ id: string }>();
  const me = useUser();
  const navigate = useNavigate();
  const [visitingUser, setVisitingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const {
    chatRooms,
    sendMessage,
    currentChatRoomId,
    leaveChatRoom,
    joinChatRoom,
  } = useChat();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const userIdNumber = Number(id);
    const currentUserId = me.user.id;

    if (currentUserId === userIdNumber) {
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
  }, [id, navigate]);

  const hasFetchedAchievements = useRef(false); // Track if achievements are already fetched

  useEffect(() => {
    if (!visitingUser) return;

    const fetchAchievements = async () => {
      try {
        const response =
          await api.Achievements.achievementsControllerFindAllbyUserId({
            userId: visitingUser.id,
          });
        setAchievements(response.achievements);
        hasFetchedAchievements.current = true; // Mark as fetched
      } catch (error) {
        console.error("Failed to fetch achievements list:", error);
      }
    };

    if (!hasFetchedAchievements.current) {
      fetchAchievements();
    }
  }, [visitingUser, api.Achievements]);

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
                <Button
                  onClick={async () => {
                    if (!visitingUser) {
                      console.error("Visiting user not found");
                      return;
                    }
                    const chatRoomKeys = Object.keys(chatRooms);
                    const chatRoomsArray = chatRoomKeys.map(
                      (key) => chatRooms[Number(key)],
                    );
                    console.log("chatRooms -->", chatRoomsArray);
                    console.log("chatRoomKeys -->", chatRoomKeys);
                    if (chatRoomKeys.length > 0) {
                      const existingChatRoomKey = chatRoomKeys.find((key) => {
                        const chatRoom = chatRooms[Number(key)];
                        console.log("chatroom -->", chatRoom);
                        const isMatch =
                          chatRoom.chat_room_type === "Dm" &&
                          chatRoom.participants.some(
                            (p) => p.userId === visitingUser.id,
                          );
                        console.log("Match found:", isMatch);
                        console.log("----------------");
                        return isMatch;
                      });

                      if (existingChatRoomKey) {
                        console.log("Already a dm session");
                        joinChatRoom(Number(existingChatRoomKey));
                        return;
                      } else {
                        await postDmChatRoom(api, me.user.id, visitingUser.id);
                      }
                      console.log("olla");
                    } else {
                      console.error("chatRooms is empty or not an object");
                    }

                    console.log(chatRooms);

                    // if (existingChatRoom) {
                    //   joinChatRoom(existingChatRoom.id);
                    //   return;
                    // }
                    // chatRooms[currentchatRoomId].chatParticipant
                    // is er al een dm sessie waarvan de user deel van is
                    // is er een chatroom dat waarbij deze user een participant heeft
                    //  waar bij de andere participant
                    // participant [0] of [1] gelijk is aan de visitingUser
                  }}
                >
                  DM {visitingUser.nickname}
                </Button>
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
