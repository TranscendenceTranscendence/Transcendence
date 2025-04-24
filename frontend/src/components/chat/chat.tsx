import { useChat } from "@/utils/providers/ChatProvider";
import { useUser } from "@/utils/providers/UserProvider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { XIcon, SendIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { ChatMessage, ChatParticipant } from "@/generated-api";
import { useNavigate } from "react-router";
import { ChatParticipantChatParticipantRoleEnum } from "@/generated-api";
import {
  PromoteUser,
  KickUser,
  MuteUser,
  BlockUser,
} from "@/chat/ChatApiCalls";
import { EditChatRoomPasswordDialog } from "@/chatroom/EditChatRoomPassword";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

// Extracted component for rendering messages
const ChatMessages = ({
  messages,
  participants,
  currentUserId,
  setSelectedMessage,
  chatComponentRef,
}: {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  currentUserId: number;
  setSelectedMessage: React.Dispatch<
    React.SetStateAction<{
      userId: number;
      x: number;
      y: number;
    } | null>
  >;
  chatComponentRef: React.RefObject<HTMLDivElement>;
}) => {
  const navigate = useNavigate();
  const handleMessageClick = (
    e: React.MouseEvent,
    user_id: number,
    chatComponentRef: React.RefObject<HTMLDivElement>,
  ) => {
    e.stopPropagation();

    if (chatComponentRef.current) {
      const rect = chatComponentRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      console.log("handleMessageClick", relativeX, relativeY);

      setSelectedMessage({
        userId: user_id,
        x: relativeX,
        y: relativeY,
      });
    }
  };
  console.log("in the message is de user", participants);
  return (
    <>
      {messages.map((msg, index) => {
        const user = participants.find((p) => p.user.id === msg.userId)?.user;
        if (!user) return null;

        const isCurrentUser: boolean = user.id === currentUserId;
        return (
          <div
            key={index}
            className={`flex flex-col gap-1 ${
              isCurrentUser ? "items-end" : "items-start"
            }`}
          >
            {isCurrentUser == false && (
              <Button
                variant="ghost"
                className="text-xs text-gray-500"
                aria-label="User name"
                size="xs"
                onClick={() => {
                  navigate(`/profile/${user.id}`);
                }}
              >
                {user.nickname}
              </Button>
            )}
            <div
              className={`flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${
                isCurrentUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
              onClick={(e) =>
                !isCurrentUser &&
                handleMessageClick(e, msg.userId, chatComponentRef)
              }
            >
              {msg.content}
            </div>
          </div>
        );
      })}
    </>
  );
};

const Chat = () => {
  const { chatRooms, sendMessage, currentChatRoomId, leaveChatRoom } =
    useChat();
  if (currentChatRoomId) console.log("test->", currentChatRoomId);
  else console.log("currentChatRoomId is null");
  const me = useUser();
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(messageSchema),
  });
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [selectedMessage, setSelectedMessage] = useState<{
    userId: number;
    x: number;
    y: number;
  } | null>(null);
  const localParticipant: ChatParticipant | undefined =
    me.user?.chatParticipants?.find((p: ChatParticipant) => {
      console.log("Comparing:", p.chatRoomId, "with", currentChatRoomId);
      return p.chatRoomId === currentChatRoomId;
    });
  const handleOutsideClick = () => {
    setSelectedMessage(null);
  };
  useEffect(() => {
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPosition.x,
      y: e.clientY - startPosition.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const PADDING = 10;
    const cardWidth = cardRef.current?.offsetWidth || 400;
    const cardHeight = cardRef.current?.offsetHeight || 500;

    setPosition({
      x: window.innerWidth - (cardWidth + PADDING),
      y: window.innerHeight - (cardHeight + PADDING),
    });
  }, [cardRef]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const onSubmit = (data: { message: string }) => {
    if (currentChatRoomId !== null) {
      sendMessage(data.message);
      reset();
    }
  };

  const handleAction = (action: string, id: number) => {
    if (action == "Kick") KickUser(currentChatRoomId, id);
    else if (action == "Promote") PromoteUser(currentChatRoomId, id);
    else if (action == "Mute") MuteUser(currentChatRoomId, id);
    else if (action == "Block") BlockUser(id);

    console.log(`${action} user with ID: ${id}`);
    setSelectedMessage(null);
  };

  const currentChatRoom = currentChatRoomId
    ? chatRooms[currentChatRoomId]
    : null;

  if (!currentChatRoomId || !currentChatRoom) {
    return null; // Display nothing when no chat is available
  }
  if (localParticipant) {
    console.log("deze", localParticipant);
  } else console.log("localParticipant is undefined");
  return (
    <Card
      ref={cardRef}
      className="w-[400px] overflow-hidden pointer-events-auto shadow-lg absolute bg-white border border-gray-300 rounded-lg"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 border-b-2 cursor-move"
        onMouseDown={handleMouseDown}
      >
        {localParticipant.chatParticipantRole ===
          ChatParticipantChatParticipantRoleEnum.Owner && (
          <EditChatRoomPasswordDialog id={currentChatRoomId} />
        )}{" "}
        <h3>Chat Room {currentChatRoomId}</h3>
        <Button
          variant="ghost"
          onClick={leaveChatRoom}
          size="icon"
          className="text-xl mt-0"
          aria-label="Leave chat room"
        >
          <XIcon />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-4 max-h-[400px] overflow-y-auto">
        <ChatMessages
          messages={currentChatRoom.messages ?? []}
          participants={currentChatRoom.participants}
          currentUserId={me.user?.id}
          setSelectedMessage={setSelectedMessage}
          chatComponentRef={cardRef}
        />
      </CardContent>
      <CardFooter className="space-x-2 py-3">
        {localParticipant.isMuted ? (
          <div>
            <p className="text-gray-500 text-sm">
              You are currently muted you can send messages again at
            </p>
            <p>
              {localParticipant.bannedUntil
                ? new Date(localParticipant.bannedUntil).toLocaleString()
                : "Not banned"}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full space-x-2"
          >
            <Input
              type="text"
              {...register("message")}
              placeholder="Type a message"
              aria-label="Message input"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <SendIcon />
            </Button>
          </form>
        )}
        {errors.message && (
          <p className="text-red-500 text-sm">
            {errors.message.message.toString()}
          </p>
        )}

        {selectedMessage && (
          <Card
            className="messagePrompt"
            style={{
              position: "absolute",
              top: selectedMessage.y,
              left: selectedMessage.x,
              background: "black",
              color: "white",
              border: "1px solid black",
              padding: "10px",
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p>Actions for User {selectedMessage.userId}:</p>
            {localParticipant &&
              (localParticipant.chatParticipantRole ==
                ChatParticipantChatParticipantRoleEnum.Owner ||
                localParticipant.chatParticipantRole ==
                  ChatParticipantChatParticipantRoleEnum.Admin) && (
                <button
                  onClick={() => handleAction("Kick", selectedMessage.userId)}
                >
                  Kick
                </button>
              )}
            {localParticipant &&
              (localParticipant.chatParticipantRole ==
                ChatParticipantChatParticipantRoleEnum.Owner ||
                localParticipant.chatParticipantRole ==
                  ChatParticipantChatParticipantRoleEnum.Admin) && (
                <button
                  onClick={() =>
                    handleAction("Promote", selectedMessage.userId)
                  }
                >
                  Promote
                </button>
              )}
            {localParticipant &&
              (localParticipant.chatParticipantRole ==
                ChatParticipantChatParticipantRoleEnum.Owner ||
                localParticipant.chatParticipantRole ==
                  ChatParticipantChatParticipantRoleEnum.Admin) && (
                <button
                  onClick={() => handleAction("Mute", selectedMessage.userId)}
                >
                  Mute
                </button>
              )}
            <button
              onClick={() => handleAction("Block", selectedMessage.userId)}
            >
              Block
            </button>
          </Card>
        )}
      </CardFooter>
    </Card>
  );
};

export default Chat;
