import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import { KeyRound } from "lucide-react";

const EditChatRoomPassword = () => {
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("password", password);
    setPassword("");
  };
  return (
    <div>
      <form onSubmit={onSubmit}>
        <input type="text" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export const EditChatRoomPasswordDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <KeyRound></KeyRound>
      </DialogTrigger>
      <div className="content-container">
        <DialogContent className="dialog-content">
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Please enter a name for your new chatroom.
          </DialogDescription>
          <EditChatRoomPassword />
        </DialogContent>
      </div>
    </Dialog>
  );
};
