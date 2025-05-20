import { ChatEvent, useChat } from "@/utils/providers/ChatProvider";
import { useUser } from "@/utils/providers/UserProvider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { XIcon, SendIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import {
  ChatMessage,
  ChatParticipant,
  ChatRoomChatRoomTypeEnum,
} from "@/generated-api";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { ChatParticipantChatParticipantRoleEnum } from "@/generated-api";
import {
  PromoteUser,
  KickUser,
  MuteUser,
  BlockUser,
} from "@/chat/ChatApiCalls";
import { EditChatRoomPasswordDialog } from "@/chatroom/EditChatRoomPassword";
import InviteToGame from "../../pages/profile/components/InviteToGame";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

// Extracted component for rendering messages
const ChatMessages = ({
  messages,
  events,
  participants,
  currentUserId,
  setSelectedMessage,
  chatComponentRef,
}: {
  messages: ChatMessage[];
  events: ChatEvent[];
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
  const scrollingRef = useRef<HTMLDivElement>(null);
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

      setSelectedMessage({
        userId: user_id,
        x: relativeX,
        y: relativeY,
      });
    }
  };

  useEffect(() => {
    if (scrollingRef.current) {
      scrollingRef.current.scrollTop = scrollingRef.current.scrollHeight;
    }
  }, [messages]);

  const parsedMessages = [...(messages ?? []), ...(events ?? [])].sort(
    (a, b) => {
      return new Date(a.sentTime).getTime() - new Date(b.sentTime).getTime();
    },
  );
  return (
    <>
      <div ref={scrollingRef} style={{ overflowY: "auto" }}>
        {parsedMessages.map((msg, index) => {
          const user =
            "userId" in msg // Check if msg is a ChatMessage
              ? participants.find((p) => p.user.id === msg.userId)?.user
              : null;

          if (!user) {
            // assuming msg is an event
            const event = msg as ChatEvent;
            return (
              <div
                key={index}
                className="flex flex-col gap-1 text-sm text-gray-500 text-center"
              >
                {event.message}
              </div>
            );
          }
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
      </div>
    </>
  );
};

const Chat = () => {
  const {
    chatRooms,
    sendMessage,
    currentChatRoomId,
    leaveChatRoom,
    deleteSession,
  } = useChat();
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

    setSelectedMessage(null);
  };

  const currentChatRoom = currentChatRoomId
    ? chatRooms[currentChatRoomId]
    : null;

  if (!currentChatRoomId || !currentChatRoom) {
    return null; // Display nothing when no chat is available
  }

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
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              deleteSession(
                currentChatRoom.participants.find(
                  (participant) => participant.user.id === me.user?.id,
                ),
              )
            }
          >
            <LogOut className="w-5 h-5" />
          </Button>
          {localParticipant &&
            localParticipant.chatParticipantRole ===
              ChatParticipantChatParticipantRoleEnum.Owner && (
              <EditChatRoomPasswordDialog id={currentChatRoomId} />
            )}{" "}
        </div>
        {currentChatRoom.chatRoomType === ChatRoomChatRoomTypeEnum.Dm && (
          <h3>
            DM with{" "}
            {
              currentChatRoom.participants.find(
                (participant) => participant.user.id !== me.user?.id,
              )?.user.nickname
            }
          </h3>
        )}
        {currentChatRoom.chatRoomType !== ChatRoomChatRoomTypeEnum.Dm && (
          <h3>Chat Room {currentChatRoomId}</h3>
        )}
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
          events={currentChatRoom.events ?? []}
          participants={currentChatRoom.participants}
          currentUserId={me.user?.id}
          setSelectedMessage={setSelectedMessage}
          chatComponentRef={cardRef}
        />
      </CardContent>
      <CardFooter className="space-x-2 py-3">
        {localParticipant &&
        localParticipant.isMuted &&
        localParticipant.bannedUntil &&
        new Date(localParticipant.bannedUntil) > new Date() ? (
          <div>
            <p className="text-gray-500 text-sm">
              You are currently muted you can send messages again at
            </p>
            <p>
              {localParticipant && localParticipant.bannedUntil
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
            {localParticipant &&
              (localParticipant.chatParticipantRole ==
                ChatParticipantChatParticipantRoleEnum.Owner ||
                localParticipant.chatParticipantRole ==
                  ChatParticipantChatParticipantRoleEnum.Admin) &&
              currentChatRoom.participants.find(
                (p) => p.user.id === selectedMessage.userId,
              )?.chatParticipantRole !==
                ChatParticipantChatParticipantRoleEnum.Owner && (
                <>
                  <Button
                    className="bg-black"
                    onClick={() => handleAction("Kick", selectedMessage.userId)}
                  >
                    Kick
                  </Button>
                  <Button
                    className="bg-black"
                    onClick={() =>
                      handleAction("Promote", selectedMessage.userId)
                    }
                  >
                    Promote
                  </Button>
                  <Button
                    className="bg-black"
                    onClick={() => handleAction("Mute", selectedMessage.userId)}
                  >
                    Mute
                  </Button>
                </>
              )}
            <Button
              className="bg-black"
              onClick={() => handleAction("Block", selectedMessage.userId)}
            >
              Block
            </Button>
            <InviteToGame
              user={{
                id: selectedMessage.userId,
                nickname: currentChatRoom.participants.find(
                  (p) => p.user.id === selectedMessage.userId,
                )?.user.nickname,
              }}
            >
              {" "}
            </InviteToGame>
          </Card>
        )}
      </CardFooter>
    </Card>
  );
};

export default Chat;
