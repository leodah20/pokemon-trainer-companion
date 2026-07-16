const mockStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStore.set(key, value);
    return Promise.resolve();
  }),
}));

import {
  loadStoredLanguage,
  saveStoredLanguage,
  loadStoredIvCalculatorInputs,
  saveStoredIvCalculatorInputs,
} from './appStorage';

describe('appStorage', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it('returns null for language when nothing was ever saved', async () => {
    expect(await loadStoredLanguage()).toBeNull();
  });

  it('round-trips a saved language', async () => {
    await saveStoredLanguage('pt-BR');
    expect(await loadStoredLanguage()).toBe('pt-BR');
  });

  it('returns null for IV calculator inputs when nothing was ever saved', async () => {
    expect(await loadStoredIvCalculatorInputs()).toBeNull();
  });

  it('round-trips saved IV calculator inputs', async () => {
    const inputs = { speciesId: 6, cpInput: '1256', hpInput: '111', minLevelInput: '1', maxLevelInput: '40' };
    await saveStoredIvCalculatorInputs(inputs);
    expect(await loadStoredIvCalculatorInputs()).toEqual(inputs);
  });

  it('does not throw when the underlying storage rejects', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('disk full'));
    await expect(loadStoredLanguage()).resolves.toBeNull();
  });
});
