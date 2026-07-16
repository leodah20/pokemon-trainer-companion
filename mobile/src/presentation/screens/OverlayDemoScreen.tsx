import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { calculateIvPercentage } from '../../domain/iv-calculator';
import { formatMoveName, getMetaTier, PvpLeague } from '../../domain/pvp';
import { analyzeScreenshot, ScreenshotAnalysis } from '../../use-cases/analyzeScreenshot';
import { buildCompanionExtraContext } from '../../use-cases/buildCompanionExtraContext';
import { CompanionAiContext, CompanionApiError, fetchCompanionSuggestion } from '../../data/companion/companionApiClient';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../theme';
import { useTranslation } from '../../i18n';
import {
  hasOverlayPermission,
  hideTestOverlay,
  isOverlaySupported,
  requestOverlayPermission,
  requestScreenCapturePermission,
  showTestOverlay,
} from '../../data/overlay/overlayBridge';

const LEAGUE_ORDER: PvpLeague[] = ['great', 'ultra', 'master'];
const AI_CONTEXTS: readonly CompanionAiContext[] = ['raid', 'battle', 'capture', 'levelup', 'general'];

type Status = 'idle' | 'loading' | 'error';
type AiState = 'idle' | 'loading' | 'error';

export function OverlayDemoScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('idle');
  const [analysis, setAnalysis] = useState<ScreenshotAnalysis | null>(null);

  const [aiContext, setAiContext] = useState<CompanionAiContext>('general');
  const [aiState, setAiState] = useState<AiState>('idle');
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [overlayPermission, setOverlayPermission] = useState<boolean | null>(null);
  const [overlayShown, setOverlayShown] = useState(false);
  const [captureConsent, setCaptureConsent] = useState<'idle' | 'checking' | 'granted' | 'denied'>('idle');

  async function handleRequestCapturePermission(): Promise<void> {
    setCaptureConsent('checking');
    const granted = await requestScreenCapturePermission();
    setCaptureConsent(granted ? 'granted' : 'denied');
  }

  async function refreshOverlayPermission(): Promise<void> {
    setOverlayPermission(await hasOverlayPermission());
  }

  // Re-checks on every focus, not just mount, so returning from the system "draw over other
  // apps" settings screen (there's no grant callback for this permission) picks up the change.
  useFocusEffect(
    useCallback(() => {
      if (isOverlaySupported()) {
        refreshOverlayPermission();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  async function handleToggleTestOverlay(): Promise<void> {
    if (overlayShown) {
      await hideTestOverlay();
      setOverlayShown(false);
      return;
    }
    const granted = await showTestOverlay();
    setOverlayShown(granted);
  }

  async function handlePickImage(): Promise<void> {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      return;
    }

    setStatus('loading');
    setAiState('idle');
    setAiText(null);
    setAiError(null);
    try {
      const nextAnalysis = await analyzeScreenshot(uri);
      setAnalysis(nextAnalysis);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  async function handleAskAi(): Promise<void> {
    if (!analysis?.species || aiState === 'loading') {
      return;
    }
    setAiState('loading');
    setAiError(null);
    try {
      // Grounded in the species AND stats this screenshot actually read — not a generic default.
      const suggestion = await fetchCompanionSuggestion(analysis.species.id, aiContext, buildCompanionExtraContext(analysis));
      setAiText(suggestion);
      setAiState('idle');
    } catch (error) {
      setAiState('error');
      setAiError(error instanceof CompanionApiError ? error.message : t('overlay.aiGenericError'));
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('overlay.title')}</Text>
        <Text style={styles.subtitle}>{t('overlay.subtitle')}</Text>

        {isOverlaySupported() && (
          <Card style={styles.nativeOverlayCard} accentColor={COLORS.mint}>
            <Text style={styles.nativeOverlayLabel}>{t('overlay.nativeExperimentalLabel')}</Text>
            <Text style={styles.sectionText}>{t('overlay.nativeExperimentalHint')}</Text>

            {overlayPermission === false && (
              <Pressable
                style={styles.pickButton}
                onPress={requestOverlayPermission}
                accessibilityRole="button"
                accessibilityLabel={t('overlay.grantPermissionButton')}
              >
                <Text style={styles.pickButtonText}>{t('overlay.grantPermissionButton')}</Text>
              </Pressable>
            )}

            {overlayPermission === true && (
              <Pressable
                style={styles.askAiButton}
                onPress={handleToggleTestOverlay}
                accessibilityRole="button"
                accessibilityLabel={overlayShown ? t('overlay.hideTestOverlayButton') : t('overlay.showTestOverlayButton')}
              >
                <Text style={styles.askAiButtonText}>
                  {overlayShown ? t('overlay.hideTestOverlayButton') : t('overlay.showTestOverlayButton')}
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.askAiButton, styles.captureConsentButton]}
              onPress={handleRequestCapturePermission}
              disabled={captureConsent === 'checking'}
              accessibilityRole="button"
              accessibilityLabel={t('overlay.requestCaptureConsentButton')}
            >
              {captureConsent === 'checking' ? (
                <ActivityIndicator size="small" color={COLORS.mintDark} />
              ) : (
                <Text style={styles.askAiButtonText}>{t('overlay.requestCaptureConsentButton')}</Text>
              )}
            </Pressable>
            {captureConsent === 'granted' && (
              <Text style={styles.sectionText}>{t('overlay.captureConsentGranted')}</Text>
            )}
            {captureConsent === 'denied' && (
              <Text style={styles.sectionText}>{t('overlay.captureConsentDenied')}</Text>
            )}
          </Card>
        )}

        <Pressable
          style={({ pressed }) => [styles.pickButton, pressed && styles.pickButtonPressed]}
          onPress={handlePickImage}
          accessibilityRole="button"
          accessibilityLabel={t('overlay.pickButton')}
        >
          <Text style={styles.pickButtonText}>{t('overlay.pickButton')}</Text>
        </Pressable>

        {status === 'loading' && <ActivityIndicator style={styles.spinner} size="large" color={COLORS.brandBlue} />}

        {status === 'error' && <Text style={styles.errorText}>{t('overlay.errorText')}</Text>}

        {analysis && status === 'idle' && (
          <View style={styles.overlayCardWrapper}>
            <Card accentColor={COLORS.brandBlue}>
              <Text style={styles.overlayLabel}>{t('overlay.resultLabel')}</Text>

              {analysis.species ? (
                <>
                  <View style={styles.speciesRow}>
                    <Image
                      source={{ uri: getSpriteUrl(analysis.species.id) }}
                      style={styles.sprite}
                      resizeMode="contain"
                    />
                    <View>
                      <Text style={styles.speciesName}>{analysis.species.name}</Text>
                      <Text style={styles.statsLine}>
                        CP {analysis.cp ?? '?'} · HP {analysis.hp ?? '?'}
                      </Text>
                    </View>
                  </View>

                  {analysis.ivMatches && analysis.ivMatches.length > 0 ? (
                    <Text style={styles.sectionText}>
                      IV: {analysis.ivMatches[0].ivAttack}/{analysis.ivMatches[0].ivDefense}/
                      {analysis.ivMatches[0].ivStamina} ({calculateIvPercentage(analysis.ivMatches[0])}%)
                      {analysis.ivMatches.length > 1
                        ? t('overlay.ivExtraMatches', { n: analysis.ivMatches.length - 1 })
                        : ''}
                    </Text>
                  ) : (
                    <Text style={styles.sectionText}>{t('overlay.ivUnmatched')}</Text>
                  )}

                  {LEAGUE_ORDER.filter((league) => analysis.pvpRankings?.[league] !== undefined).map((league) => {
                    const moveset = analysis.pvpRankings![league]!;
                    return (
                      <Text key={league} style={styles.sectionText}>
                        {t(`pvpLeague.${league}`)}: {formatMoveName(moveset.fastMove)} +{' '}
                        {moveset.chargedMoves.map(formatMoveName).join(' / ')} (
                        {t(`metaTier.${getMetaTier(moveset.score)}`)})
                      </Text>
                    );
                  })}

                  {analysis.bulkRanking && (
                    <Text style={styles.sectionText}>
                      {t('overlay.defense')}: {t(`bulkTier.${analysis.bulkRanking.tier}`)}
                    </Text>
                  )}

                  {analysis.suggestions.length > 0 && (
                    <>
                      <Text style={styles.suggestionsLabel}>{t('overlay.whatToDoWithIt')}</Text>
                      {analysis.suggestions.map((suggestion) => (
                        <Text key={suggestion} style={styles.suggestionText}>
                          • {suggestion}
                        </Text>
                      ))}
                    </>
                  )}

                  <Text style={styles.suggestionsLabel}>{t('overlay.askAiAboutScan')}</Text>
                  <View style={styles.contextRow}>
                    {AI_CONTEXTS.map((option) => (
                      <Pressable
                        key={option}
                        style={[styles.contextChip, option === aiContext && styles.contextChipSelected]}
                        onPress={() => setAiContext(option)}
                        accessibilityRole="button"
                        accessibilityLabel={t(`aiContext.${option}`)}
                        accessibilityState={{ selected: option === aiContext }}
                      >
                        <Text style={[styles.contextChipText, option === aiContext && styles.contextChipTextSelected]}>
                          {t(`aiContext.${option}`)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {aiState === 'error' && aiError && <Text style={styles.aiErrorText}>{aiError}</Text>}
                  {aiText && aiState === 'idle' && <Text style={styles.aiResultText}>{aiText}</Text>}

                  <Pressable
                    style={styles.askAiButton}
                    onPress={handleAskAi}
                    disabled={aiState === 'loading'}
                    accessibilityRole="button"
                    accessibilityLabel={aiState === 'error' ? t('companion.retryAskAi') : aiText ? t('companion.askAgain') : t('companion.askAi')}
                  >
                    {aiState === 'loading' ? (
                      <ActivityIndicator size="small" color={COLORS.surface} />
                    ) : (
                      <Text style={styles.askAiButtonText}>
                        {aiState === 'error' ? t('companion.retryAskAi') : aiText ? t('companion.askAgain') : t('companion.askAi')}
                      </Text>
                    )}
                  </Pressable>
                </>
              ) : (
                <Text style={styles.sectionText}>{t('overlay.speciesNotRecognized')}</Text>
              )}

              <Text style={styles.rawTextLabel}>{t('overlay.rawTextLabel')}</Text>
              <Text style={styles.rawText}>{analysis.rawText || t('overlay.rawTextEmpty')}</Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.xl,
    color: COLORS.brandRed,
  },
  subtitle: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  nativeOverlayCard: {
    marginTop: SPACING.lg,
  },
  nativeOverlayLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.mintDark,
  },
  pickButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.brandBlue,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOW.lg,
  },
  pickButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  pickButtonText: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.surface,
  },
  spinner: {
    marginTop: SPACING.xl,
  },
  errorText: {
    marginTop: SPACING.lg,
    color: COLORS.danger,
    textAlign: 'center',
  },
  overlayCardWrapper: {
    marginTop: SPACING.xl,
  },
  overlayLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.brandBlue,
    marginBottom: SPACING.sm,
  },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  sprite: {
    width: 64,
    height: 64,
  },
  speciesName: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
  },
  statsLine: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  suggestionsLabel: {
    marginTop: SPACING.lg,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.mint,
  },
  suggestionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    lineHeight: 19,
  },
  contextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  contextChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassSurface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  contextChipSelected: {
    backgroundColor: COLORS.brandBlue,
    borderColor: COLORS.brandBlue,
  },
  contextChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contextChipTextSelected: {
    color: COLORS.surface,
  },
  aiErrorText: {
    marginTop: SPACING.sm,
    fontSize: 11,
    color: COLORS.danger,
  },
  aiResultText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  askAiButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.mintDark,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  captureConsentButton: {
    backgroundColor: COLORS.turquoise,
  },
  askAiButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.surface,
  },
  rawTextLabel: {
    marginTop: SPACING.lg,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  rawText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontFamily: 'monospace',
  },
});
