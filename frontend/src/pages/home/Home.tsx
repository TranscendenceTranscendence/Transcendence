import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { useApi } from "@/utils/api";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Achievement, Friend } from "@/generated-api";
import { FriendsBox } from "./components/FriendsBox";
import { AchievementBox } from "./components/AchievementsBox";
import { useUser } from "@/utils/providers/UserProvider";
import { useNavigate } from "react-router-dom";
import { ChatRoomContainer } from "@/chatroom/ChatRoomContainer";
import { DialogPostChatroom } from "@/chatroom/DialogPostChatroom";
import ChatContainer from "@/chat/ChatContainer";

export default function Page() {
  const navigate = useNavigate();
  const api = useApi();
  const me = useUser();
  const [chatRoomId, setChatRoomId] = useState(() => {
    try {
      const savedId = localStorage.getItem("chatRoomId");
      return savedId ? JSON.parse(savedId) : 1;
    } catch (error) {
      console.error("Failed to parse chatRoomId from localStorage:", error);
      return 1;
    }
  });
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
    navigate("/game");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            {/* <SidebarTrigger className="-ml-1" /> */}
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="grid grid-flow-col grid-rows-3 gap-8 m-16 ">
          <FriendsBox friends={friends} />
          <div className="col-span-2 w-full ...">
            <Button
              onClick={handlePlayClick}
              className="p-16 font-bold text-5xl rounded-xl w-full hover:bg-primary/90"
            >
              P L A Y
            </Button>
          </div>
          <div className="col-span-2 row-span-2 w-full rounded-xl bg-gray-200 ...">
            <div className="flex items-center gap-2">
              <p className="font-bold text-3xl m-4">CHAT ROOMS</p>
              <DialogPostChatroom />
            </div>
            <ChatRoomContainer
              userDetails={me}
              chatRoomId={chatRoomId}
              setChatRoomId={setChatRoomId}
            />
          </div>
          <AchievementBox achievements={achievements} />
          <ChatContainer chatRoomId={chatRoomId} userId={151953} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
