import React, { useState } from "react";
import { Button } from "@/components/ui/button";
// import { User } from "@/generated-api";

// interface InviteToGameProps {
//   user: User;
// }

const InviteToGame: React.FC = () => {
  // const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async () => {
    console.log("Invite to game, LOGIC NOT IMPLEMENTED");
    setIsLoading(true);
    try {
      setError(null);
      setSuccess("yet to be implemented!");
    } catch (err) {
      setError("Failed to send game invite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleInvite} disabled={isLoading}>
        {isLoading ? "Sending..." : "Invite to Game"}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
};

export default InviteToGame;
