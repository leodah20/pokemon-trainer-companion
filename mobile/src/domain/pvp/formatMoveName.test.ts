import { formatMoveName } from './formatMoveName';

describe('formatMoveName', () => {
  it('title-cases a multi-word move id', () => {
    expect(formatMoveName('VINE_WHIP')).toBe('Vine Whip');
  });

  it('handles a single-word move id', () => {
    expect(formatMoveName('HEX')).toBe('Hex');
  });

  it('handles a three-word move id', () => {
    expect(formatMoveName('DYNAMIC_PUNCH')).toBe('Dynamic Punch');
  });
});
