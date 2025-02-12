import React, { useEffect, useState } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { useApi } from '@/utils/api'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface Friends {
 friend: Friends;
}

class Friends {
  id: number;
  nickname: string;
  email: string;
  ladder_level: number;
  avatar: string;

  constructor({id, nickname, email, ladder_level, avatar }: {id: number; nickname: string; email: string; ladder_level: number; avatar: string }) {
    this.id = id;
    this.nickname = nickname;
    this.email = email;
    this.ladder_level = ladder_level;
    this.avatar = avatar;
  }
}

export default function Page() {
  {
    const api = useApi();
    const [friends, setFriends] = useState<Friends[]>([]);
    
    useEffect(() => {
      const fetchFriends = async () => {
        try {
          const response = await api.Friends.friendsControllerGetFriendRequests();
          const friends = Array.isArray(response) ? response.map((friend) => new Friends(friend)) : [];
          setFriends(friends);
        } catch (error) {
          console.error('Failed to fetch friends list:', error);
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
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex flex-col items-center gap-2">
                      <p className="font-bold text-xl">{friend.nickname}</p>
                      <p className="font-bold text-lg">Level {friend.ladder_level}</p>
                      <img src={friend.avatar} alt={friend.nickname} className="w-24 h-24 rounded-full" />
                    </div>
                  ))}
              </div>
            </div>
            <div className="col-span-2 w-full ...">
              <Button className="p-16 font-bold text-5xl rounded-xl w-full">P L A Y</Button>
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
    )
  }
}
