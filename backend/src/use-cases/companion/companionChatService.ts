import { Injectable } from '@nestjs/common';
import { generateChatReply } from '../../data/companion/geminiClient';
import { buildChatSystemPrompt } from './buildChatSystemPrompt';
import { ChatMessage } from '../../domain/companion/types';

@Injectable()
export class CompanionChatService {
  async reply(history: ChatMessage[]): Promise<string> {
    return generateChatReply(history, buildChatSystemPrompt());
  }
}
