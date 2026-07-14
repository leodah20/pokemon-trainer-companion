import { parseOcrText } from './parseOcrText';

const KNOWN_NAMES = ['Bulbasaur', 'Charmander', 'Pikachu', 'Raichu'];

describe('parseOcrText', () => {
  it('extracts species name, CP, and HP from a typical status-screen text block', () => {
    const raw = '[SAMPLE TEST IMAGE]\nPIKACHU\nCP 900\nHP 111\nStardust to power up: 1600';
    expect(parseOcrText(raw, KNOWN_NAMES)).toEqual({ speciesName: 'Pikachu', cp: 900, hp: 111 });
  });

  it('prefers the longest matching species name to avoid substring false positives', () => {
    const namesWithASubstringDecoy = ['Char', 'Charmander'];
    const raw = 'CHARMANDER\nCP 500\nHP 60';
    expect(parseOcrText(raw, namesWithASubstringDecoy).speciesName).toBe('Charmander');
  });

  it('returns nulls for fields it cannot find', () => {
    const raw = 'no useful text here';
    expect(parseOcrText(raw, KNOWN_NAMES)).toEqual({ speciesName: null, cp: null, hp: null });
  });

  it('is case-insensitive for both species name and labels', () => {
    const raw = 'bulbasaur\ncp: 500\nhp: 80';
    expect(parseOcrText(raw, KNOWN_NAMES)).toEqual({ speciesName: 'Bulbasaur', cp: 500, hp: 80 });
  });
});
