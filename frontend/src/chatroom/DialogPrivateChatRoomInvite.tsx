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
import {
  ChatParticipantChatParticipantRoleEnum,
  ChatRoomsControllerCreateRequest,
  User,
} from "@/generated-api";
import PropTypes from "prop-types";
import { useApi } from "@/utils/api/index.ts";

export const PrivateChatRoomInviteList = ({ userId, visitingUserId }) => {
  const { chatRooms } = useChatRooms();
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
        chatRooms.chatRooms
          .filter((chatRoom) => {
            const isPrivate = chatRoom.chatRoomType === "private";
            console.log("Checking if chatRoom is private:", isPrivate);

            const hasOwner = chatRoom.chatParticipants.some((participant) => {
              const isOwner =
                participant.chatParticipantRole ===
                  ChatParticipantChatParticipantRoleEnum.Owner &&
                participant.userId === userId;
              console.log(
                `Checking participant (userId: ${participant.userId}, role: ${participant.chatParticipantRole}) is owner in ${chatRoom.chatRoomType}:`,
                isOwner,
              );
              console.log(participant.userId, userId.user);
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
