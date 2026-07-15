export type SupportedLanguage = 'en' | 'pt-BR' | 'es';

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['en', 'pt-BR', 'es'];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  'pt-BR': 'Português',
  es: 'Español',
};

/** Every translatable string in the app, as a flat dictionary keyed by dot-path. Every language
 * file must implement exactly this shape — a missing key is a compile error, not a silent
 * runtime fallback, so translations can't quietly drift out of sync as new UI ships. */
export interface TranslationKeys {
  'nav.pokedex': string;
  'nav.tools': string;
  'nav.rankings': string;
  'nav.quiz': string;
  'nav.more': string;

  'pokedex.title': string;
  'pokedex.searchPlaceholder': string;
  'pokedex.allGens': string;
  'pokedex.allTypes': string;
  'pokedex.pickerTitle': string;
  'pokedex.emptyResults': string;

  'tools.title': string;
  'tools.subtitle': string;
  'tools.ivCalculator.title': string;
  'tools.ivCalculator.description': string;
  'tools.compare.title': string;
  'tools.compare.description': string;
  'tools.typeChart.title': string;
  'tools.typeChart.description': string;
  'tools.raidCounters.title': string;
  'tools.raidCounters.description': string;

  'more.title': string;
  'more.overlayDemo.title': string;
  'more.overlayDemo.description': string;
  'more.language': string;
  'more.footer': string;

  'common.change': string;
  'common.retry': string;
  'common.close': string;
  'common.calculate': string;
  'common.loading': string;

  'companion.askAi': string;
  'companion.askAgain': string;
  'companion.retryAskAi': string;
  'companion.choosePrompt': string;
  'companion.searchPlaceholder': string;
}
