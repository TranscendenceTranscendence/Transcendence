import { ChatMessage } from '../chat_message.entity';

export class MessagesResponse {
  success: boolean;
  data?: ChatMessage[];
  message?: string;
}
