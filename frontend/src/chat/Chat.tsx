import { ChatRoomContainer } from "../chatroom/ChatRoomContainer.tsx";
// import { useUserDetails } from "./ChatApiCalls.tsx";
import { useUser } from "@/utils/providers/UserProvider";
import { DevBarLayout } from "@/utils/layouts/DevBarLayout.tsx";

export const Chat = () => {
  const me = useUser();

  if (!me) return <div>Loading user data...</div>;
  return (
    <div>
      <DevBarLayout />
      <ChatRoomContainer userDetails={me} />
    </div>
  );
};
