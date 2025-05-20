import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useApi } from "@/utils/api";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import type { Achievement, Friend } from "@/generated-api";
import { FriendsBox } from "./components/FriendsBox";
import { AchievementBox } from "./components/AchievementsBox";
import { useUser } from "@/utils/providers/UserProvider";
import { useNavigate } from "react-router-dom";
import { ChatRoomContainer } from "@/chatroom/ChatRoomContainer";
import { DialogPostChatRoom } from "@/chatroom/DialogPostChatroom";
import SearchUsersBox from "./components/SearchUsersBox";
import { FriendRequestsBox } from "./components/FriendRequestsBox";
import Statistics from "../statistics/Statistics";
import InviteBox from "./components/InviteBox";

export default function Page() {
  const navigate = useNavigate();
  const api = useApi();
  const me = useUser();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await api.Friends.friendsControllerGetFriends();
        setFriends(response.data);
      } catch (error) {
        console.error("Failed to fetch friends list:", error);
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
    Promise.all([fetchFriends(), fetchAchievements()]);
  }, [me.user]);

  const handlePlayClick = () => {
    navigate("/queue");
  };

  const userId = me.user?.id;
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-4 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="grid grid-flow-row-dense grid-cols-3 gap-4 p-4 auto-rows-min">
          <div className="col-span-full">
            <SearchUsersBox />
          </div>

          {/* First column: Friends + Friend Requests */}
          <div className="col-span-1 flex flex-col gap-3 h-full">
            <FriendsBox friends={friends} />
            <FriendRequestsBox />
          </div>

          {/* Second column: Play Button + Chat Rooms */}
          <div className="col-span-1 flex flex-col gap-4 h-full">
            <Button
              onClick={handlePlayClick}
              className="p-16 font-bold text-5xl rounded-xl w-full hover:bg-primary/90"
            >
              P L A Y
            </Button>
            <div className="rounded-xl bg-gray-200 flex-grow">
              <div className="flex items-center flex-col h-full">
                <div className="flex flex-row justify-between items-center gap-2 p-4 w-full">
                  <p className="font-bold text-3xl">CHAT ROOMS</p>
                  <div>
                    <DialogPostChatRoom userId={userId} />
                  </div>
                </div>
                <div className="w-full flex-grow">
                  <ChatRoomContainer />
                </div>
              </div>
            </div>
          </div>

          {/* Third column: Achievements + Invite Box */}
          <div className="col-span-1 flex flex-col gap-4 h-full">
            <div className="flex-1">
              <AchievementBox achievements={achievements} />
            </div>
            <div className="flex-1">
              <InviteBox />
            </div>
          </div>

          <div className="col-span-full">
            <Statistics />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
      </SidebarInset>
    </SidebarProvider>
  );
}
