import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { useApi } from "@/utils/api";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Friend } from "@/generated-api";

export default function Page() {
  const api = useApi();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await api.Friends.friendsControllerGetFriends();
        setFriends(response.data);
      } catch (error) {
        console.error("Failed to fetch friends list:", error);
      }
    };

    fetchFriends();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="grid grid-flow-col grid-rows-3 gap-8 m-16 ">
          <div className="row-span-3 w-full rounded-xl bg-gray-200 ...">
            <p className="font-bold text-3xl m-8">FRIENDS</p>
            <div className="grid grid-cols-3 gap-4">
              {friends.map(({ receiver, sender }) => (
                // TODO(Daan): check which user is the current user and display the other user
                <div
                  key={receiver.id}
                  className="flex flex-col items-center gap-2"
                >
                  <p className="font-bold text-xl">{receiver.nickname}</p>
                  <p className="font-bold text-lg">
                    Level {receiver.ladderLevel}
                  </p>
                  <img
                    src={receiver.avatar}
                    alt={receiver.nickname}
                    className="w-24 h-24 rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 w-full ...">
            <Button className="p-16 font-bold text-5xl rounded-xl w-full">
              P L A Y
            </Button>
          </div>
          <div className="col-span-2 row-span-2 w-full rounded-xl bg-gray-200 ...">
            <p className="font-bold text-3xl m-8">CHAT ROOMS</p>
          </div>
          <div className="row-span-3 w-full rounded-xl bg-gray-200 ...">
            <p className="font-bold text-3xl m-8">ACHIEVEMENTS</p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
