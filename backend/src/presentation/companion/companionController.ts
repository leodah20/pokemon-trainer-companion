import { BadRequestException, Body, Controller, Post, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanionService } from '../../use-cases/companion/companionService';
import { GeminiNotConfiguredError, GeminiRequestError } from '../../data/companion/geminiClient';
import { COMPANION_CONTEXTS } from '../../domain/companion/types';
import { CompanionSuggestRequestDto, CompanionSuggestResponseDto } from './dto/companionRequestDto';

@ApiTags('Companion AI')
@Controller('companion')
export class CompanionController {
  constructor(private readonly companionService: CompanionService) {}

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
}
