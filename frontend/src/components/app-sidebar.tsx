import React from "react";
import { Link } from "react-router-dom";
// import { useApi } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import AvatarDisplay from "../pages/updateUser/components/AvatarDisplay";
import { Avatar } from "@/components/ui/avatar";
// import { useNavigate } from "react-router-dom";
import { useUser } from "@/utils/providers/UserProvider";

// class User {
//   id: number;
//   nickname: string;
//   email: string;
//   ladderLevel: number;
//   avatar: string;
//   constructor({ id, nickname, email, ladderLevel, avatar }: User) {
//     this.id = id;
//     this.nickname = nickname;
//     this.email = email;
//     this.ladderLevel = ladderLevel;
//     this.avatar = avatar;
//   }
// }

export function AppSidebar() {
  {
    const me = useUser();
    // const api = useApi();

    if (!me.user) {
      return <div>Loading...</div>;
    }

    return (
      <Sidebar>
        <SidebarContent className="flex flex-col items-center">
          <Avatar className="w-60 h-60 p-4">
            <AvatarDisplay user={me.user} />
          </Avatar>
          <div className="flex flex-col items-center gap-4">
            <p className="font-bold text-3xl">{me.user.nickname}</p>
            <p className="font-bold text-lg">Level {me.user.ladderLevel}</p>
          </div>
          <br />
          <div className="flex flex-col gap-2">
            <Button className="p-4 rounded-xl w-48" asChild>
              <Link to={`/profile/${me.user.id}`}>Profile</Link>
            </Button>
            <Button className="p-4 rounded-xl w-48" asChild>
              <Link to={`/profile/${me.user.id}`}>Share Profile</Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button onClick={me.logout} className="p-4 rounded-xl">
                Logout
              </Button>
              <Button className="p-4 rounded-xl" asChild>
                <Link to="/update">
                  <SettingsIcon /> Settings
                </Link>
              </Button>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }
}
