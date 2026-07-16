import { ApiProperty } from '@nestjs/swagger';
import { CHAT_ROLES } from '../../../domain/companion/types';
import type { ChatRole } from '../../../domain/companion/types';

export class ChatMessageDto {
  @ApiProperty({ enum: CHAT_ROLES })
  role: ChatRole;

  @ApiProperty()
  text: string;
}

// No class-validator pipeline is wired up in this project yet (see SpeciesFilterDto) — validated
// manually in the controller instead, same pattern as CompanionSuggestRequestDto.
export class CompanionChatRequestDto {
  @ApiProperty({
    type: [ChatMessageDto],
    description: 'Full conversation so far, oldest first, ending with the newest user message',
  })
  history: ChatMessageDto[];
}

export class CompanionChatResponseDto {
  @ApiProperty() reply: string;
}
