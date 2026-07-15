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

  it('extracts HP from the real "current/max HP" layout, not just a "HP: n" label', () => {
    const raw = 'PIKACHU\nCP 900\n111 / 111 HP\nStardust to power up: 1600';
    expect(parseOcrText(raw, KNOWN_NAMES)).toEqual({ speciesName: 'Pikachu', cp: 900, hp: 111 });
  });

  it('extracts CP and HP from a Portuguese-language Pokemon GO screen (PC/PS labels)', () => {
    // Real OCR output from a Mewtwo status screen with the game set to Portuguese.
    const raw = ['98,91kg', 'PESO', '13.552', 'POEIRA ESTELAR', 'PC3975', 'L38 iV82 12/14/11', '175 / 175 PS', 'MEWTWO'].join(
      '\n',
    );
    expect(parseOcrText(raw, ['Mewtwo'])).toEqual({ speciesName: 'Mewtwo', cp: 3975, hp: 175 });
  });
});
