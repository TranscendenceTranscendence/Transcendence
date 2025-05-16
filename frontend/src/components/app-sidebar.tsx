import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import AvatarDisplay from "../pages/updateUser/components/AvatarDisplay";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/utils/providers/UserProvider";

export function AppSidebar() {
  {
    const me = useUser();
    if (!me.user) {
      return <div>Loading...</div>;
    }

    return (
      <Sidebar>
        <SidebarContent className="flex flex-col items-center">
          <Avatar className="w-60 h-60 p-4">
            <AvatarDisplay className="w-full" user={me.user} />
          </Avatar>
          <div className="flex flex-col items-center gap-4">
            <p className="font-bold text-3xl">{me.user.nickname}</p>
            <p className="font-bold text-lg">ELO: {me.user.elo}</p>
          </div>
          <br />
          <div className="flex flex-col gap-2">
            <Button className="p-4 rounded-xl w-48" asChild>
              <Link to={`/profile`}>Profile</Link>
            </Button>
            <Button className="p-4 rounded-xl w-48" asChild>
              <Link to={`/invite`}>Invites</Link>
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
