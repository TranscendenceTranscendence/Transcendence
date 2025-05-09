import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useChatRoomsForPrivateInvite } from "./ApiRequest";
import PropTypes from "prop-types";
import { useApi } from "@/utils/api/index.ts";

export const PrivateChatRoomInviteList = ({ visitingUserId }) => {
  const { chatRooms } = useChatRoomsForPrivateInvite();
  const api = useApi();

  const addVisitingParticipantToChatRoom = async (chatRoomId: number) => {
    try {
      await api.ChatParticipants.chatParticipantsControllerAddParticipantToChatroom(
        {
          chatRoomId,
          userId: visitingUserId,
        },
      );
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  return (
    <div>
      {Array.isArray(chatRooms?.chatRooms) &&
        chatRooms.chatRooms.map((chatRoom) => (
          <div key={chatRoom.id} className="chat-room-item">
            <div>{chatRoom.title}</div>
            <Button
              onClick={() => addVisitingParticipantToChatRoom(chatRoom.id)}
            >
              Invite
            </Button>
          </div>
        ))}
    </div>
  );
};

PrivateChatRoomInviteList.propTypes = {
  userId: PropTypes.number.isRequired,
  visitingUserId: PropTypes.number.isRequired,
};

export const DialogPrivateChatRoomInvite = ({
  userId,
  visitingUserId,
}: {
  userId: number;
  visitingUserId: number;
}) => {
  console.log("Visting in dialog --> ", visitingUserId);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Invite to private chat room</Button>
      </DialogTrigger>
      <div className="content-container">
        <DialogContent className="dialog-content">
          <DialogTitle>Invite to Private Chat Room</DialogTitle>
          <DialogDescription></DialogDescription>
          <PrivateChatRoomInviteList
            userId={userId}
            visitingUserId={visitingUserId}
          />
        </DialogContent>
      </div>
    </Dialog>
  );
};
