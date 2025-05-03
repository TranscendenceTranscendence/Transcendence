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
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
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

    fetchCurrentUser();
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

  // Fetch sent invites
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

  // Set up polling for new invites instead of using sockets
  useEffect(() => {
    // We already have polling set up in the fetchPendingInvites function
    // So we don't need additional polling here
  }, []);

  const handleSendInvite = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user to invite",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Send invite via REST API
      await api.Invite.inviteControllerCreateInvite({
        createInviteDto: {
          receiverUserId: selectedUser,
        },
      });

      toast({
        title: "Success",
        description: "Game invitation sent successfully",
      });

      // Add to sent invites list
      const newInvite = {
        id: Date.now(), // Temporary ID
        senderUserId: currentUser?.id || 0,
        receiverUserId: selectedUser,
        status: "pending" as const,
        createdAt: new Date(),
        expiresAt: undefined,
      };
      setSentInvites((prev) => [...prev, newInvite]);

      // Clear selection
      setSelectedUser(null);

      // Refresh sent invites
      if (currentUser?.id) {
        const response = await api.Invite.inviteControllerGetSentInvites();
        setSentInvites(response || []);
      }
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
      // Accept invite via API
      const response = await api.Invite.inviteControllerAcceptInvite({
        inviteId: inviteId,
      });

      // Navigate to game if we have a game room ID
      if (response?.gameRoomId) {
        navigate(`/game/${response.gameRoomId}`);
      }

      // Remove from pending invites
      setPendingInvites((prev) =>
        prev.filter((invite) => invite.id !== inviteId),
      );

      toast({
        title: "Success",
        description: "Game invitation accepted",
      });
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
    return date.toLocaleString();
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

      {/* Send Invite Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Send Invite</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="p-2 border rounded-md flex-grow"
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(Number(e.target.value))}
            disabled={loading || !currentUser}
          >
            <option value="">Select a player</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.nickname || `User #${user.id}`}
              </option>
            ))}
          </select>

          <Button
            onClick={handleSendInvite}
            disabled={!selectedUser || loading || !currentUser}
          >
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </div>
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
