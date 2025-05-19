import PropTypes from "prop-types";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@radix-ui/react-dialog";
import "../css/DialogChatRoom.css";
import { Button } from "@/components/ui/button";
import { PostChatRoom } from "./PostChatRoom";
import { useState } from "react";

export const DialogPostChatRoom = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (typeof userId !== "number") return null;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>+</Button>
      </DialogTrigger>

      <DialogContent
        className="dialog-content"
        style={{ background: "none", boxShadow: "none", padding: 0 }}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Create New Chat Room</DialogTitle>
        <PostChatRoom userId={userId} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};

DialogPostChatRoom.propTypes = {
  userId: PropTypes.number.isRequired,
};
