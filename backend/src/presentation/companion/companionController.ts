import { BadRequestException, Body, Controller, Post, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanionService } from '../../use-cases/companion/companionService';
import { CompanionChatService } from '../../use-cases/companion/companionChatService';
import { GeminiNotConfiguredError, GeminiRequestError } from '../../data/companion/geminiClient';
import { CHAT_ROLES, COMPANION_CONTEXTS } from '../../domain/companion/types';
import { CompanionSuggestRequestDto, CompanionSuggestResponseDto } from './dto/companionRequestDto';
import { CompanionChatRequestDto, CompanionChatResponseDto } from './dto/companionChatDto';

const MAX_CHAT_HISTORY = 40;

@ApiTags('Companion AI')
@Controller('companion')
export class CompanionController {
  constructor(
    private readonly companionService: CompanionService,
    private readonly companionChatService: CompanionChatService,
  ) {}

  @Post('suggest')
  @ApiOperation({
    summary: 'Get an AI-generated tip for a species in a given context (raid/battle/capture/levelup/general)',
  })
  async suggest(@Body() body: CompanionSuggestRequestDto): Promise<CompanionSuggestResponseDto> {
    if (!Number.isInteger(body.speciesId)) {
      throw new BadRequestException('speciesId must be an integer');
    }
    if (!COMPANION_CONTEXTS.includes(body.context)) {
      throw new BadRequestException(`context must be one of ${COMPANION_CONTEXTS.join(', ')}`);
    }

    try {
      const suggestion = await this.companionService.getSuggestion(body.speciesId, body.context, body.extra);
      return { suggestion };
    } catch (error) {
      if (error instanceof GeminiNotConfiguredError) {
        throw new ServiceUnavailableException(error.message);
      }
      if (error instanceof GeminiRequestError) {
        throw new ServiceUnavailableException(`Companion AI is temporarily unavailable: ${error.message}`);
      }
      throw error;
    }
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Open-ended chat with the Companion AI — the trainer can ask anything, not just a species-scoped suggestion',
  })
  async chat(@Body() body: CompanionChatRequestDto): Promise<CompanionChatResponseDto> {
    if (!Array.isArray(body.history) || body.history.length === 0) {
      throw new BadRequestException('history must be a non-empty array');
    }
    if (body.history.length > MAX_CHAT_HISTORY) {
      throw new BadRequestException(`history must have at most ${MAX_CHAT_HISTORY} messages`);
    }
    for (const message of body.history) {
      if (!CHAT_ROLES.includes(message.role)) {
        throw new BadRequestException(`each message's role must be one of ${CHAT_ROLES.join(', ')}`);
      }
      if (typeof message.text !== 'string' || message.text.trim() === '') {
        throw new BadRequestException("each message's text must be a non-empty string");
      }
    }
    if (body.history[body.history.length - 1].role !== 'user') {
      throw new BadRequestException('the last message in history must be from the user');
    }

    try {
      const reply = await this.companionChatService.reply(body.history);
      return { reply };
    } catch (error) {
      if (error instanceof GeminiNotConfiguredError) {
        throw new ServiceUnavailableException(error.message);
      }
      if (error instanceof GeminiRequestError) {
        throw new ServiceUnavailableException(`Companion AI is temporarily unavailable: ${error.message}`);
      }
      throw error;
    }
  }
}
