import React, { useState, useEffect } from "react";
import { useApi } from "../../utils/api";
import { Button } from "../../components/ui/button";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  nickname: string;
  avatar?: string;
}

interface Invite {
  id: number;
  senderUserId: number;
  receiverUserId: number;
  status: "pending" | "accepted" | "declined" | "expired";
  gameRoomId?: string;
  createdAt: Date;
  expiresAt?: Date;
}

const Invite: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [sentInvites, setSentInvites] = useState<Invite[]>([]);
  const api = useApi();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const userData = await api.Users.usersControllerMe();
        setCurrentUser(userData);
      } catch (err) {
        console.error("Error fetching current user:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllOnlineUsers = async () => {
      try {
        setLoading(true);
        const onlineUsers =
          await api.Invite.inviteControllerFindAllOnlineUsers();
        setUsers(onlineUsers);
      } catch (err) {
        console.error("Error fetching online users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOnlineUsers();
    fetchCurrentUser();

    const interval = setInterval(fetchAllOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPendingInvites = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        const response = await api.Invite.inviteControllerGetPendingInvites();
        setPendingInvites(response || []);
      } catch (err) {
        console.error("Error fetching pending invites:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPendingInvites();
      const interval = setInterval(fetchPendingInvites, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchSentInvites = async () => {
      if (!currentUser?.id) return;

      try {
        const response = await api.Invite.inviteControllerGetSentInvites();
        setSentInvites(response || []);
      } catch (err) {
        console.error("Error fetching sent invites:", err);
      }
    };

    if (currentUser) {
      fetchSentInvites();
      const interval = setInterval(fetchSentInvites, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleSendInvite = async (targetUserId: number) => {
    try {
      setLoading(true);

      await api.Invite.inviteControllerCreateInvite({
        createInviteDto: {
          receiverUserId: targetUserId,
        },
      });

      const targetUser = users.find((user) => user.id === targetUserId);
      const targetName = targetUser?.nickname || `User #${targetUserId}`;

      toast({
        title: "Success",
        description: `Game invitation sent to ${targetName}`,
      });

      if (currentUser?.id) {
        const response = await api.Invite.inviteControllerGetSentInvites();
        setSentInvites(response || []);
      }

      navigate("/game");
    } catch (err) {
      console.error("Error sending invite:", err);
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
      const response = await api.Invite.inviteControllerAcceptInvite({
        inviteId: inviteId,
      });

      if (response?.gameRoomId) {
        navigate(`/game/${response.gameRoomId}`);
      }

      setPendingInvites((prev) =>
        prev.filter((invite) => invite.id !== inviteId),
      );

      toast({
        title: "Success",
        description: "Game invitation accepted",
      });
      navigate("/game");
    } catch (err) {
      console.error("Error accepting invite:", err);
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

      // Remove from pending invites
      setPendingInvites((prev) =>
        prev.filter((invite) => invite.id !== inviteId),
      );

      toast({
        title: "Info",
        description: "Game invitation declined",
      });
    } catch (err) {
      console.error("Error declining invite:", err);
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Check if a user has already been invited
  const isAlreadyInvited = (userId: number) => {
    return sentInvites.some(
      (invite) =>
        invite.receiverUserId === userId && invite.status === "pending",
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Game Invites</h1>

      {/* Current User Info */}
      {currentUser && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p>
            Logged in as:{" "}
            <strong>{currentUser.nickname || `User #${currentUser.id}`}</strong>
          </p>
        </div>
      )}

      {/* Online Users Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Online Users</h2>

        {users.length === 0 ? (
          <p className="text-gray-500">No online users found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="border p-3 rounded-md bg-white flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {user.nickname || `User #${user.id}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSendInvite(user.id)}
                  disabled={loading || isAlreadyInvited(user.id)}
                >
                  {isAlreadyInvited(user.id) ? "Invited" : "Invite"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Pending Invites</h2>

        {!currentUser ? (
          <p className="text-gray-500">Loading user data...</p>
        ) : pendingInvites.length === 0 ? (
          <p className="text-gray-500">No pending invites</p>
        ) : (
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="border p-3 rounded-md">
                <p>
                  <strong>From:</strong>{" "}
                  {users.find((u) => u.id === invite.senderUserId)?.nickname ||
                    `User #${invite.senderUserId}`}
                </p>
                <p className="text-sm text-gray-500">
                  Sent: {formatDate(invite.createdAt)}
                </p>

                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeclineInvite(invite.id)}
                    disabled={loading}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptInvite(invite.id)}
                    disabled={loading}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Invites Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Sent Invites</h2>

        {!currentUser ? (
          <p className="text-gray-500">Loading user data...</p>
        ) : sentInvites.length === 0 ? (
          <p className="text-gray-500">No sent invites</p>
        ) : (
          <div className="space-y-3">
            {sentInvites.map((invite) => (
              <div key={invite.id} className="border p-3 rounded-md">
                <p>
                  <strong>To:</strong>{" "}
                  {users.find((u) => u.id === invite.receiverUserId)
                    ?.nickname || `User #${invite.receiverUserId}`}
                </p>
                <p className="text-sm text-gray-500">Status: {invite.status}</p>
                <p className="text-sm text-gray-500">
                  Sent: {formatDate(invite.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md">
          Loading...
        </div>
      )}
    </div>
  );
};

export default Invite;
