import AvatarDisplay from "./components/AvatarDisplay";
import ProfileForm from "./components/ProfileForm";
import type { UpdateUserDto } from "../../generated-api";
import { useCallback, useState } from "react";

export default function UpdateUser() {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

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
        <ProfileForm onSend={onSend} />
      </div>
    </div>
  );
}
