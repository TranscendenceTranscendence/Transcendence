import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApi } from '@/utils/api';
import {
  UsersApi
} from "../generated-api";
import {
  AppleIcon,
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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

/**
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  ladder_level: number;
  nickname: string;
  enable_two_factor: boolean;
}
 */
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <Avatar className="aspect-ratio-box">
          <AvatarImage src="https://github.com/shadcn.png" alt="@avatar" />
          <AvatarFallback>User Avatar</AvatarFallback>
        </Avatar>
        <NavUser user={user} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
}
