import { ChatRoomContainer } from "../chatroom/ChatRoomContainer.tsx";
// import { useUserDetails } from "./ChatApiCalls.tsx";
import { useUser } from "@/utils/providers/UserProvider";

export const Chat = () => {
  const me = useUser();

  if (!me) return <div>Loading user data...</div>;
  return (
    <div>
      <ChatRoomContainer userDetails={me} />
    </div>
  );
};
