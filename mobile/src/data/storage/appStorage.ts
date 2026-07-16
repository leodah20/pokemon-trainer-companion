import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'ptc.language';
const IV_CALCULATOR_KEY = 'ptc.ivCalculator.lastInputs';

export interface StoredIvCalculatorInputs {
  speciesId: number;
  cpInput: string;
  hpInput: string;
  minLevelInput: string;
  maxLevelInput: string;
}

/**
 * Every read/write here is best-effort: a storage failure (e.g. disk full, first-run race) should
 * never crash the app or block a screen — it should just fall back to the in-memory default,
 * same as if nothing had ever been persisted.
 */
export async function loadStoredLanguage(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

export async function saveStoredLanguage(language: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // ignore — persistence is a nice-to-have, not required for the app to function
  }
}

export async function loadStoredIvCalculatorInputs(): Promise<StoredIvCalculatorInputs | null> {
  try {
    const raw = await AsyncStorage.getItem(IV_CALCULATOR_KEY);
    return raw ? (JSON.parse(raw) as StoredIvCalculatorInputs) : null;
  } catch {
    return null;
  }
}

export async function saveStoredIvCalculatorInputs(inputs: StoredIvCalculatorInputs): Promise<void> {
  try {
    await AsyncStorage.setItem(IV_CALCULATOR_KEY, JSON.stringify(inputs));
  } catch {
    // ignore — persistence is a nice-to-have, not required for the app to function
  }
}
