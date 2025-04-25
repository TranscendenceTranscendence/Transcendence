import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useChat } from "@/utils/providers/ChatProvider";
import { useChatRoomsForPrivateInvite } from "./ApiRequest";
import {
  ChatParticipantChatParticipantRoleEnum,
  ChatRoomsControllerCreateRequest,
  User,
} from "@/generated-api";
import PropTypes from "prop-types";
import { useApi } from "@/utils/api/index.ts";

export const PrivateChatRoomInviteList = ({ userId, visitingUserId }) => {
  const { chatRooms } = useChatRoomsForPrivateInvite();
  const api = useApi();

  console.log(
    "ChatRooms in privateChatRoomInviteList --> ",
    chatRooms?.chatRooms,
  );
  console.log("User in privateChatRoomInviteList --> ", userId);
  console.log("VisitingUser in privateChatRoomInviteList --> ", visitingUserId);

  const addVisitingParticipantToChatRoom = async (chatRoomId: number) => {
    try {
      console.log("api call values-->", visitingUserId, chatRoomId);
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
