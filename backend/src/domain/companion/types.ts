export type CompanionContext = 'raid' | 'battle' | 'capture' | 'levelup' | 'general';

export const COMPANION_CONTEXTS: readonly CompanionContext[] = ['raid', 'battle', 'capture', 'levelup', 'general'];

export type ChatRole = 'user' | 'model';

export const CHAT_ROLES: readonly ChatRole[] = ['user', 'model'];

export interface ChatMessage {
  role: ChatRole;
  text: string;
}
