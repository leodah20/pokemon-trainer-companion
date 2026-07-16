import { fetchChatReply, CompanionApiError } from './companionApiClient';

describe('fetchChatReply', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns the reply text on success', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: 'Pikachu is great in the Great League with a Fast TM.' }),
    }) as unknown as typeof fetch;

    const reply = await fetchChatReply([{ role: 'user', text: 'Is Pikachu good in PvP?' }]);
    expect(reply).toBe('Pikachu is great in the Great League with a Fast TM.');
  });

  it('throws CompanionApiError when the backend is unreachable', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    await expect(fetchChatReply([{ role: 'user', text: 'hi' }])).rejects.toThrow(CompanionApiError);
  });

  it('throws CompanionApiError on a non-ok response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch;

    await expect(fetchChatReply([{ role: 'user', text: 'hi' }])).rejects.toThrow(CompanionApiError);
  });

  it('throws CompanionApiError when the response has no reply field', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }) as unknown as typeof fetch;

    await expect(fetchChatReply([{ role: 'user', text: 'hi' }])).rejects.toThrow(CompanionApiError);
  });
});
