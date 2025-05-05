import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/utils/api";
import { toast } from "@/hooks/use-toast";
import { User } from "@/generated-api";
import { useNavigate } from "react-router-dom";

interface InviteToGameProps {
  user: User;
}

const InviteToGame: React.FC<InviteToGameProps> = ({ user }) => {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSentInvite, setHasSentInvite] = useState(false);
  const navigate = useNavigate();
  // Check if the current user has already sent an invite to this user
  useEffect(() => {
    const checkExistingInvite = async () => {
      if (!user || !user.id) return;

      try {
        setIsLoading(true);
        const sentInvites = await api.Invite.inviteControllerGetSentInvites();
        const existingInvite = sentInvites.find(
          (invite) =>
            invite.receiverUserId === user.id && invite.status === "pending",
        );

        setHasSentInvite(!!existingInvite);
      } catch (err) {
        console.error("Failed to check existing invites:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingInvite();
  }, [user?.id]);

  const handleInvite = async () => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "Cannot invite: invalid user",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.Invite.inviteControllerCreateInvite({
        createInviteDto: {
          receiverUserId: user.id,
        },
      });

      setHasSentInvite(true);

      toast({
        title: "Success",
        description: `Game invitation sent to ${user.nickname || `User #${user.id}`}`,
      });

      navigate("/game");
    } catch (err) {
      console.error("Failed to send game invite:", err);
      toast({
        title: "Error",
        description: "Failed to send game invite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClasses = "w-24 justify-center text-nowrap md:w-24";

  if (isLoading) {
    return (
      <Button disabled size="sm" className={buttonClasses}>
        Loading...
      </Button>
    );
  }

  if (hasSentInvite) {
    return (
      <Button
        variant="default"
        size="sm"
        className={`bg-orange-500 hover:bg-orange-500 text-white font-medium ${buttonClasses}`}
        disabled
      >
        Invited
      </Button>
    );
  }

  return (
    <Button onClick={handleInvite} size="sm" className={buttonClasses}>
      Play Game
    </Button>
  );
};

export default InviteToGame;
