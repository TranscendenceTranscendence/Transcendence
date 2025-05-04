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
  if (typeof userId !== "number") return null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+</Button>
      </DialogTrigger>

      <DialogContent
        className="dialog-content"
        style={{ background: "none", boxShadow: "none", padding: 0 }}
      >
        <PostChatRoom userId={userId} />
      </DialogContent>
    </Dialog>
  );
};

DialogPostChatRoom.propTypes = {
  userId: PropTypes.number.isRequired,
};
