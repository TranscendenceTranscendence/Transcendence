import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApi } from '@/utils/api';
import { Button } from "@/components/ui/button"
import { ChevronRight, SettingsIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
}

// This is sample data.
class User {
  nickname: string;
  email: string;
  ladder_level: number;
  avatar: string;

  constructor({ nickname, email, ladder_level, avatar }: { nickname: string; email: string; ladder_level: number; avatar: string }) {
    this.nickname = nickname;
    this.email = email;
    this.ladder_level = ladder_level;
    this.avatar = avatar;
  }
};


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
{
  const api = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.Users.usersControllerMe();
        const me = new User({ nickname: response.nickname, email: response.email, ladder_level: response.ladderLevel, avatar: response.avatar });
        setUser(me);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        setError('Failed to fetch user data');
      }
    };

    fetchCurrentUser();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col items-center">
        <Avatar className="w-60 h-60 p-4">
            <AvatarImage src={user.avatar} alt={user.nickname} />
            <AvatarFallback>{user.nickname}</AvatarFallback>
          </Avatar>
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-3xl">{user.nickname}</p>
          <p className="font-bold text-lg">Level {user.ladder_level}</p>
        </div>
        <br />
        <div className="flex flex-col gap-2">
          <Button className="p-4 rounded-xl w-48">Profile</Button>
          <Button className="p-4 rounded-xl w-48">Share Profile</Button>
          <div className="flex items-center gap-2">
            <Button className="p-4 rounded-xl">Logout</Button>
            <Button className="p-4 rounded-xl">
              <SettingsIcon /> Settings
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
}
