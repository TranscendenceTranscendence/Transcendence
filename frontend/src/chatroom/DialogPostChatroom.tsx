import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@radix-ui/react-dialog";
import "../css/DialogChatRoom.css";
import { Button } from "@/components/ui/button";
import { PostChatRoom } from "./PostChatRoom";

export const DialogPostChatroom: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+</Button>
      </DialogTrigger>
      <div className="content-container">
        <DialogContent className="dialog-content">
          <DialogTitle>Create a New Chatroom</DialogTitle>
          <DialogDescription>
            Please enter a name for your new chatroom.
          </DialogDescription>
          <PostChatRoom userId={1} />
        </DialogContent>
      </div>
    </Dialog>
  );
};
