import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useApi } from '@/utils/api';
import { Button } from "@/components/ui/button"
import { SettingsIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,

} from "@/components/ui/sidebar"
import AvatarDisplay from "../pages/updateUser/components/AvatarDisplay";
import {
  Avatar
} from "@/components/ui/avatar"
import { useNavigate } from 'react-router-dom'



class User {
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


export function AppSidebar() {
  {
    const navigate = useNavigate();
    
    const handleLogout = async () => {
      try {
          await axios.post('https://localhost:3000/auth/logout', {}, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          });
          // Clear local storage
          localStorage.removeItem('access_token');
          // localStorage.removeItem('refreshToken'); // If you have a refresh token
      
          // Redirect to login page
          navigate('/login');
      } catch (error) {
          console.error('Error logging out:', error);
      }
    };
    const api = useApi();
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchCurrentUser = async () => {
        try {
          const response = await api.Users.usersControllerMe();
          const me = new User({id: response.id, nickname: response.nickname, email: response.email, ladder_level: response.ladderLevel, avatar: response.avatar });
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
              <AvatarDisplay avatarUrl={user.avatar} />
            </Avatar>
          <div className="flex flex-col items-center gap-4">
            <p className="font-bold text-3xl">{user.nickname}</p>
            <p className="font-bold text-lg">Level {user.ladder_level}</p>
          </div>
          <br />
          <div className="flex flex-col gap-2">
            <Button className="p-4 rounded-xl w-48" asChild>
              <Link to={`/profile/${user.id}`}>Profile</Link>
              </Button>
            <Button className="p-4 rounded-xl w-48" asChild>
              <Link to={`/profile/${user.id}`}>Share Profile</Link>
              </Button>
            <div className="flex items-center gap-2">
              <Button onClick={handleLogout} className="p-4 rounded-xl">Logout</Button>
              <Button className="p-4 rounded-xl" asChild>
                <Link to="/update"><SettingsIcon /> Settings</Link>
              </Button>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }
}
