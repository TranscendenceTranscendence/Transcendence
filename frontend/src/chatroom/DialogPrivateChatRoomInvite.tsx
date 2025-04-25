import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useChat } from "@/utils/providers/ChatProvider";
import { useChatRooms } from "./ApiRequest";
import { ChatParticipantChatParticipantRoleEnum, User } from "@/generated-api";
import PropTypes from "prop-types";

export const PrivateChatRoomInviteList = ({ userId, visitingUserId }) => {
  const { chatRooms } = useChatRooms();

  console.log("ChatRooms in privateChatRoomInviteList --> ", chatRooms);
  console.log("User in privateChatRoomInviteList --> ", userId);
  console.log("VisitingUser in privateChatRoomInviteList --> ", visitingUserId);
  return (
    <div>
      {Array.isArray(chatRooms?.chatRooms) &&
        chatRooms.chatRooms
          .filter((chatRoom) => {
            const isPrivate = chatRoom.chatRoomType === "private";
            console.log("Checking if chatRoom is private:", isPrivate);

            const hasOwner = chatRoom.chatParticipants.some((participant) => {
              const isOwner =
                participant.chatParticipantRole ===
                  ChatParticipantChatParticipantRoleEnum.Owner &&
                participant.userId === userId.user;
              console.log(
                `Checking participant (userId: ${participant.userId}, role: ${participant.chatParticipantRole}) is owner:`,
                isOwner,
              );
              return isOwner;
            });

            console.log(
              `ChatRoom (id: ${chatRoom.id}, title: ${chatRoom.title}) passes filter:`,
              isPrivate && hasOwner,
            );

            return isPrivate && hasOwner;
          })
          .map((chatRoom) => (
            <div key={chatRoom.id} className="chat-room-item">
              <div>{chatRoom.title}</div>
              <Button onClick={}>Invite</Button>
            </div>
          ))}
    </div>
  );
};

PrivateChatRoomInviteList.propTypes = {
  userId: PropTypes.number.isRequired,
  visitingUserId: PropTypes.number.isRequired,
};

export const DialogPrivateChatRoomInvite = (
  userId: number,
  visitingUserId: number,
) => {
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
