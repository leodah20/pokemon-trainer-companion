import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { LanguageProvider, useTranslation } from './LanguageContext';
import * as appStorage from '../data/storage/appStorage';

jest.mock('../data/storage/appStorage');

const mockedLoadStoredLanguage = appStorage.loadStoredLanguage as jest.Mock;
const mockedSaveStoredLanguage = appStorage.saveStoredLanguage as jest.Mock;

function Probe(): React.JSX.Element {
  const { language } = useTranslation();
  return <Text>{language}</Text>;
}

describe('LanguageProvider persistence', () => {
  beforeEach(() => {
    mockedLoadStoredLanguage.mockReset().mockResolvedValue(null);
    mockedSaveStoredLanguage.mockReset().mockResolvedValue(undefined);
  });

  it('defaults to English when nothing was ever persisted', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <LanguageProvider>
          <Probe />
        </LanguageProvider>,
      );
    });
    expect(tree!.root.findByType(Text).props.children).toBe('en');
  });

  it('restores a previously persisted language on mount', async () => {
    mockedLoadStoredLanguage.mockResolvedValue('es');
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <LanguageProvider>
          <Probe />
        </LanguageProvider>,
      );
    });
    expect(tree!.root.findByType(Text).props.children).toBe('es');
  });

  it('persists the language whenever it changes', async () => {
    let capturedSetLanguage: ((language: 'en' | 'pt-BR' | 'es') => void) | null = null;
    function Setter(): React.JSX.Element {
      const { setLanguage } = useTranslation();
      capturedSetLanguage = setLanguage;
      return <Text>ready</Text>;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <LanguageProvider>
          <Setter />
        </LanguageProvider>,
      );
    });

    await ReactTestRenderer.act(async () => {
      capturedSetLanguage!('pt-BR');
    });

    expect(mockedSaveStoredLanguage).toHaveBeenCalledWith('pt-BR');
  });
});
