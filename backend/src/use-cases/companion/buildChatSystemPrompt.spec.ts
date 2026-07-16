import { buildChatSystemPrompt } from './buildChatSystemPrompt';

describe('buildChatSystemPrompt', () => {
  it('frames the assistant as a Pokemon-focused chat companion', () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain('Pokemon Trainer Companion');
    expect(prompt.length).toBeGreaterThan(50);
  });
});
