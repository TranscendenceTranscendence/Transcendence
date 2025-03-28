import PropTypes from "prop-types";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import "../css/DialogChatRoom.css";
import { Button } from "@/components/ui/button";
import { PostChatRoom } from "./PostChatRoom";

export const DialogPostChatRoom = ({ userId }) => {
  if (typeof userId !== "number") return null; // Ensure userId is a number
  console.log("sadfdsf", userId);
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
          <PostChatRoom userId={userId} />
        </DialogContent>
      </div>
    </Dialog>
  );
};

// ✅ Prop Validation: Ensure userId is a required number
DialogPostChatRoom.propTypes = {
  userId: PropTypes.number.isRequired,
};
