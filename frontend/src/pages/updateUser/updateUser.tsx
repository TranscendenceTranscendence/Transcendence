import AvatarDisplay from "./components/AvatarDisplay";
import ProfileForm from "./components/ProfileForm";
import type { UpdateUserDto } from "../../generated-api";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function UpdateUser() {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const onSend = useCallback((data: UpdateUserDto) => {
    setAvatarUrl(data.avatar);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      {/* Sidebar for avatar display */}
      <div className=" md:flex flex-col items-start bg-background p-10 border-r w-1/3">
        <AvatarDisplay avatarUrl={avatarUrl} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-grow items-start p-4 sm:p-10 w-full md:w-2/3">
        <div className="flex flex-row items-stretch w-full justify-between">
          <ProfileForm onSend={onSend} />
          <Button onClick={() => navigate("/")}>Home</Button>
        </div>
      </div>
    </div>
  );
}
