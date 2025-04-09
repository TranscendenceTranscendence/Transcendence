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
import { LogOut } from "lucide-react";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

// Extracted component for rendering messages
const ChatMessages = ({
  messages,
  participants,
  currentUserId,
}: {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  currentUserId: number;
}) => {
  const navigate = useNavigate();
  if (messages.length === 0) {
    return <p className="text-center text-gray-500">No messages yet.</p>;
  }

  return (
    <>
      {messages.map((msg, index) => {
        const user = participants.find((p) => p.user.id === msg.userId)?.user;
        if (!user) return null;

        const isCurrentUser = user.id === currentUserId;

        return (
          <div
            key={index}
            className={`flex flex-col gap-1 ${
              isCurrentUser ? "items-end" : "items-start"
            }`}
          >
            {!isCurrentUser && (
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
        />
      </CardContent>
      <CardFooter className="space-x-2 py-3">
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
        {errors.message && (
          <p className="text-red-500 text-sm">
            {errors.message.message.toString()}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default Chat;
