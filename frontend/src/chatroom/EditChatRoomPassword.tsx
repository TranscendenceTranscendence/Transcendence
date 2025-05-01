import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import { KeyRound } from "lucide-react";
import { ChatRoomsControllerEditPasswordRequest } from "@/generated-api/index.ts";
import { useApi } from "@/utils/api/index.ts";
import { Button } from "@/components/ui/button";

const EditChatRoomPassword = ({ id }: { id: number }) => {
  const [password, setPassword] = useState("");
  const api = useApi();

  const editPassword = async () => {
    try {
      const updatedChatRoomData: ChatRoomsControllerEditPasswordRequest = {
        chatRoomId: id,
        updateChatRoomDto: {
          password: password,
        },
      };

      await api.ChatRooms.chatRoomsControllerEditPassword(updatedChatRoomData);
    } catch (error) {
      console.error("Error updating chat room password:", error);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("password", password);
    editPassword();
    setPassword("");
  };

  const removePassword = async () => {
    setPassword("");
    editPassword();
  };
  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Add title"
          required
        />
        <button type="submit">Submit</button>
      </form>
      <Button
        variant="outline"
        className="w-full mt-4"
        onClick={() => {
          removePassword();
        }}
      >
        Remove password
      </Button>
    </div>
  );
};

export const EditChatRoomPasswordDialog = ({ id }: { id: number }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <KeyRound />
      </DialogTrigger>
      <div className="content-container">
        <DialogContent className="dialog-content">
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Please enter a name for your new chatroom.
          </DialogDescription>
          <EditChatRoomPassword id={id} />
        </DialogContent>
      </div>
    </Dialog>
  );
};
