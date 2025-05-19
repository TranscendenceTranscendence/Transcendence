import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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

  const hasChatRooms =
    chatRooms &&
    Array.isArray(chatRooms.chatRooms) &&
    chatRooms.chatRooms.length > 0;

  return (
    <div className="chat-rooms-invite-container">
      {!hasChatRooms ? (
        <div className="no-chats-message">
          <p>
            No private chats found, make your first chat in the home screen!
          </p>
        </div>
      ) : (
        <div className="chat-rooms-list">
          {chatRooms.chatRooms.map((chatRoom) => (
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
      )}
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Invite to private chat room</Button>
      </DialogTrigger>
      <DialogContent className="dialog-content">
        <DialogTitle>Invite to Private Chat Room</DialogTitle>
        <DialogDescription>
          Select a private chat room to invite this user to.
        </DialogDescription>
        <PrivateChatRoomInviteList
          userId={userId}
          visitingUserId={visitingUserId}
        />
      </DialogContent>
    </Dialog>
  );
};
