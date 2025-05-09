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
        <header className="flex h-0 shrink-0 items-center gap-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="grid grid-flow-row-dense grid-cols-3 gap-4 p-4 auto-rows-min">
          <div className="col-span-full">
            <SearchUsersBox />
          </div>
          <div className="flex flex-col col-span-1 gap-3">
            <FriendsBox friends={friends} />
            <FriendRequestsBox />
          </div>
          <div className="col-span-1 flex flex-col gap-4">
            <Button
              onClick={handlePlayClick}
              className="p-16 font-bold text-5xl rounded-xl w-full hover:bg-primary/90"
            >
              P L A Y
            </Button>
            <div className="rounded-xl bg-gray-200">
              <div className="flex items-center flex-col">
                <div className="flex flex-row justify-between items-center gap-2 p-4 w-full">
                  <p className="font-bold text-3xl">CHAT ROOMS</p>
                  <div>
                    <DialogPostChatRoom userId={userId} />
                  </div>
                </div>
                <div className="w-full">
                  <ChatRoomContainer />
                </div>
              </div>
            </div>
          </div>
          <div className=" col-span-1 w-full">
            <AchievementBox achievements={achievements} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
