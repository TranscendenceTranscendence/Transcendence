import React, { useState, useEffect } from "react";
import { useApi } from "../../../utils/api";
import { Button } from "../../../components/ui/button";
import { toast } from "../../../hooks/use-toast";
import { User, Invite } from "../../../generated-api";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";
import AvatarDisplay from "@/pages/updateUser/components/AvatarDisplay";

const InviteBox: React.FC = () => {
  const api = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [sentInvites, setSentInvites] = useState<Invite[]>([]);

  // Fetch online users and invites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const users = await api.Invite.inviteControllerFindAllOnlineUsers();
        const pending = await api.Invite.inviteControllerGetPendingInvites();
        const sent = await api.Invite.inviteControllerGetSentInvites();

        setOnlineUsers(users);
        setPendingInvites(pending);
        setSentInvites(sent);
      } catch (error) {
        console.error("Error fetching invite data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const isAlreadyInvited = (userId: number) => {
    return sentInvites.some(
      (invite) =>
        invite.receiverUserId === userId && invite.status === "pending",
    );
  };

  const handleSendInvite = async (targetUserId: number) => {
    if (isAlreadyInvited(targetUserId)) return;

    try {
      setLoading(true);
      await api.Invite.inviteControllerCreateInvite({
        createInviteDto: {
          receiverUserId: targetUserId,
        },
      });

      const targetUser = onlineUsers.find((user) => user.id === targetUserId);
      toast({
        title: "Success",
        description: `Game invitation sent to ${targetUser?.nickname || `User #${targetUserId}`}`,
      });

      const sent = await api.Invite.inviteControllerGetSentInvites();
      setSentInvites(sent);

      navigate("/game");
    } catch (error) {
      console.error("Failed to send invite:", error);
      toast({
        title: "Error",
        description: "Failed to send game invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      setLoading(true);
      await api.Invite.inviteControllerAcceptInvite({
        inviteId: inviteId,
      });

      navigate("/game");

      toast({
        title: "Success",
        description: "Game invitation accepted",
      });
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineInvite = async (inviteId: number) => {
    try {
      setLoading(true);
      await api.Invite.inviteControllerDeclineInvite({
        inviteId: inviteId,
      });

      setPendingInvites((prev) =>
        prev.filter((invite) => invite.id !== inviteId),
      );

      toast({
        title: "Info",
        description: "Game invitation declined",
      });
    } catch (error) {
      console.error("Error declining invite:", error);
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-xl h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-center gap-2">
          <p className="font-bold text-3xl">GAME INVITES</p>
          {pendingInvites.length > 0 && (
            <Badge variant="destructive">{pendingInvites.length}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-center py-2">Loading...</div>}

        {pendingInvites.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-sm font-medium">Pending Invites</h3>
            {pendingInvites.map((invite) => {
              const sender = onlineUsers.find(
                (user) => user.id === invite.senderUserId,
              );
              return (
                <div
                  key={invite.id}
                  className="flex items-center justify-between bg-muted p-2 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <AvatarDisplay user={sender} />
                    <span className="text-sm">
                      {sender?.nickname || `User #${invite.senderUserId}`}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleDeclineInvite(invite.id)}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleAcceptInvite(invite.id)}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Online users */}
        <div>
          <h3 className="text-sm font-medium mb-2">
            Online Users ({onlineUsers.length})
          </h3>
          {onlineUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No online users found
            </p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-auto">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <AvatarDisplay user={user} />
                    <span className="text-sm">
                      {user.nickname || `User #${user.id}`}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={isAlreadyInvited(user.id) || loading}
                    onClick={() => handleSendInvite(user.id)}
                  >
                    {isAlreadyInvited(user.id) ? "Invited" : "Invite"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link to full page */}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/invite")}
          >
            View All Invites
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteBox;
