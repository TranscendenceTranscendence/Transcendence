import React, { useState, useEffect } from "react";
import { PostChatRoom } from "../utils/PostRequest.tsx";
import  ChatRoomList from "./ChatRoomList.tsx";
import ChatContainer from "../chat/ChatContainer.tsx";
import { handleSubmitParticipant } from "../utils/PostRequest.tsx";
import { MeResponseSuccess } from '@/generated-api/index.ts';
import { useFetchRequest } from "../utils/FetchRequest.tsx";
import { JoinPrivate } from "./JoinPrivate.tsx";
import { useApi } from "@/utils/api/index.ts";

export const getChatRoomWithParticipants = () => {
    const api = useApi();
    const [messages, setMessages] = useState<oldMessage[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await api.ChatMessages.chatMessagesControllerFindOne({ id: chatRoomId });
          console.log("Fetched Messages:", response.data);
          setMessages(response.data || []);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      };
  
      if (chatRoomId) {
        fetchMessages();
      }
    }, [chatRoomId]);
    console.log("MessagesUseEffect:", messages);
    return { messages, loading, error };
  };