import React from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface GameNotificationProps {
  title?: string;
  message: string;
  gameId?: string;
}

export function showGameInviteToast({
  title = "Game Found",
  message,
}: GameNotificationProps) {
  return toast({
    title: title,
    description: message,
    duration: 10000, // 10 seconds
    action: <GameToastAction />,
  });
}

function GameToastAction() {
  const navigate = useNavigate();

  const handleAccept = () => {
    navigate("/game");
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleAccept}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      Join Game
    </Button>
  );
}

// export function useGameNotifications() {
//   const showGameInvitation = (message: string, gameId?: string) => {
//     showGameInviteToast({ message, gameId });
//   };

//   return {
//     showGameInvitation,
//   };
// }
