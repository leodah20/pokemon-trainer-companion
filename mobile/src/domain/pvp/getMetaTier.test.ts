import { getMetaTier } from './getMetaTier';

describe('getMetaTier', () => {
  it('classifies a high score as top meta', () => {
    expect(getMetaTier(95.9)).toBe('top');
  });

  it('classifies a mid score as viable', () => {
    expect(getMetaTier(75)).toBe('viable');
  });

  it('classifies a low score as niche', () => {
    expect(getMetaTier(40)).toBe('niche');
  });

  it('treats the boundaries as inclusive on the lower bound', () => {
    expect(getMetaTier(90)).toBe('top');
    expect(getMetaTier(70)).toBe('viable');
  });
});
