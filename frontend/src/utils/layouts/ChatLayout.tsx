import React from "react";
import { Outlet } from "react-router-dom";
import { useUser } from "@/utils/providers/UserProvider";
import Chat from "@/components/chat/chat";

// filepath: /Users/daan/Projects/42/Transcendence/frontend/src/utils/layouts/ChatLayout.tsx

const ChatLayout: React.FC = () => {
  const user = useUser();

  if (!user || !user.user) {
    return <div>Loading user data...</div>;
  }

  return (
    <>
      <Outlet />
      <div className="fixed bottom-0 right-0 w-full h-[calc(100vh-4rem)] pointer-events-none z-50">
        <Chat />
      </div>
    </>
  );
};

export default ChatLayout;
