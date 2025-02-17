import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockedDto } from './create-blocked.dto';

export class UpdateBlockedDto extends PartialType(CreateBlockedDto) {}
