import { useState } from "react";
import { useApi } from "@/utils/api";
import {
  ChatParticipantChatParticipantRoleEnum,
  ChatRoomsControllerCreateRequest,
  CreateChatRoomDtoChatRoomTypeEnum,
} from "@/generated-api";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocation, useNavigate } from "react-router-dom";

interface PostChatRoomProps {
  userId: number;
  setIsOpen: (isOpen: boolean) => void;
}

export const PostChatRoom = ({ userId, setIsOpen }: PostChatRoomProps) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState<{ error?: string } | null>(null);
  const [type, setType] = useState<CreateChatRoomDtoChatRoomTypeEnum>("public");
  const api = useApi();

  const addChatRoom = async () => {
    try {
      const chatRoomData: ChatRoomsControllerCreateRequest = {
        createChatRoomDto: {
          title: name,
          password: password || "",
          creationDate: new Date(),
          chatRoomType: type,
          userId: userId,
          role: ChatParticipantChatParticipantRoleEnum.Owner,
        },
      };
      await api.ChatRooms.chatRoomsControllerCreate(chatRoomData);
    } catch (error) {
      console.error("Error creating chat room:", error);
      setResponse({ error: String(error) });
    } finally {
      setIsOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addChatRoom();
    setName("");
    setPassword("");
  };

  return (
    <Card className="w-[500px] max-w-md mx-auto p-6 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Chat Room</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room title"
              required
            />
          </div>

          {type === "protected" && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                required
              />
            </div>
          )}

          <div>
            <Label className="mb-2 block">Chat Room Type</Label>
            <RadioGroup
              defaultValue={type}
              onValueChange={(value) =>
                setType(value as CreateChatRoomDtoChatRoomTypeEnum)
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">Public</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="protected" id="protected" />
                <Label htmlFor="protected">Protected</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">Private</Label>
              </div>
            </RadioGroup>
          </div>

          <CardFooter className="flex justify-center pt-6">
            <Button className={"p-6"} type="submit">
              Create
            </Button>
          </CardFooter>
        </form>

        {response?.error && (
          <div className="mt-4 text-red-600 text-sm text-center">
            <p>Error: {response.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

PostChatRoom.propTypes = {
  userId: PropTypes.number.isRequired,
};
