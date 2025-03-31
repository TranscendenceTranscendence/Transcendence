import React, { useEffect } from "react";
import { useChat } from "@/utils/providers/ChatProvider";
import { useUser } from "@/utils/providers/UserProvider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DoorOpenIcon, GhostIcon, SendIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

const Chat = () => {
  const { chatRooms, sendMessage, currentChatRoomId, leaveChatRoom } =
    useChat();
  const me = useUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(messageSchema),
  });

  const onSubmit = (data: { message: string }) => {
    if (currentChatRoomId !== null) {
      sendMessage(data.message);
      reset();
    }
  };

  const currentChatRoom = currentChatRoomId
    ? chatRooms[currentChatRoomId]
    : null;

  return (
    <div className="flex flex-col items-center justify-center h-full pointer-events-none">
      {currentChatRoom && (
        <Card className="w-[400px] overflow-hidden pointer-events-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <h3>Chat Room {currentChatRoomId}</h3>
            <Button
              variant="ghost"
              onClick={leaveChatRoom}
              size="icon"
              className="text-xl mt-0"
            >
              <GhostIcon size="2em" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {currentChatRoom.messages.map((msg, index) => {
              const user = currentChatRoom.participants.find(
                (p) => p.user.id === msg.userId,
              )?.user;
              if (!user) return null;

              const isCurrentUser = user.id === me.user?.id;

              return (
                <div
                  key={index}
                  className={`flex flex-col
                     gap-1 ${isCurrentUser ? "items-end" : "items-start"}`}
                >
                  {!isCurrentUser && (
                    <strong className="text-sm text-gray-500">
                      {user.nickname}:
                    </strong>
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
          </CardContent>
          <CardFooter className="space-x-2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full space-x-2"
            >
              <Input
                type="text"
                {...register("message")}
                placeholder="Type a message"
              />
              <Button type="submit" size="icon">
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
      )}
    </div>
  );
};

export default Chat;
