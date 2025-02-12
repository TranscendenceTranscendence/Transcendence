import { PartialType } from '@nestjs/mapped-types';
import { CreateChatMessageDto } from './create-chat_message.dto';

export class UpdateChatMessageDto extends PartialType(CreateChatMessageDto) {}
