import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { calculateIvPercentage } from '../../domain/iv-calculator';
import { formatMoveName, getMetaTier, PvpLeague } from '../../domain/pvp';
import { analyzeOcrText, analyzeScreenshot, ScreenshotAnalysis } from '../../use-cases/analyzeScreenshot';
import { buildCompanionExtraContext } from '../../use-cases/buildCompanionExtraContext';
import { CompanionAiContext, CompanionApiError, fetchCompanionSuggestion } from '../../data/companion/companionApiClient';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../theme';
import { useTranslation } from '../../i18n';
import { TranslationKeys } from '../../i18n/types';
import { RootStackParamList } from '../navigation/types';
import {
  hasOverlayPermission,
  hideTestOverlay,
  isOverlaySupported,
  onOverlayFrameText,
  onOverlayTapped,
  requestOverlayPermission,
  requestScreenCapturePermission,
  showTestOverlay,
  startLiveCapture,
  stopLiveCapture,
  updateOverlayText,
} from '../../data/overlay/overlayBridge';

const LEAGUE_ORDER: PvpLeague[] = ['great', 'ultra', 'master'];
const AI_CONTEXTS: readonly CompanionAiContext[] = ['raid', 'battle', 'capture', 'levelup', 'general'];

type Status = 'idle' | 'loading' | 'error';
type AiState = 'idle' | 'loading' | 'error';
type LiveOverlayState = 'idle' | 'starting' | 'active';

// Keeps the floating bubble compact -- the full answer is always one tap away in Professor Mode.
const OVERLAY_AI_TIP_MAX_CHARS = 220;

type Translate = (key: keyof TranslationKeys, params?: Record<string, string | number>) => string;

function formatOverlayHeader(analysis: ScreenshotAnalysis): string {
  const headerParts = [analysis.species!.name];
  if (analysis.cp !== null) {
    headerParts.push(`CP ${analysis.cp}`);
  }
  if (analysis.ivMatches && analysis.ivMatches.length > 0) {
    headerParts.push(`IV ${calculateIvPercentage(analysis.ivMatches[0])}%`);
  }
  return headerParts.join(' · ');
}

// Picks the single best-scoring league to show in the overlay -- there's no room to list all
// three leagues in a floating bubble, so surface whichever one this Pokemon is actually good in.
function formatPvpLine(analysis: ScreenshotAnalysis, t: Translate): string | null {
  if (!analysis.pvpRankings) {
    return null;
  }
  let best: [PvpLeague, NonNullable<ScreenshotAnalysis['pvpRankings']>[PvpLeague]] | null = null;
  for (const league of LEAGUE_ORDER) {
    const moveset = analysis.pvpRankings[league];
    if (moveset && (!best || moveset.score > best[1]!.score)) {
      best = [league, moveset];
    }
  }
  if (!best) {
    return null;
  }
  const [league, moveset] = best;
  return `${t(`pvpLeague.${league}`)}: ${formatMoveName(moveset!.fastMove)} + ${moveset!.chargedMoves.map(formatMoveName).join('/')} (${t(`metaTier.${getMetaTier(moveset!.score)}`)})`;
}

function formatBulkLine(analysis: ScreenshotAnalysis, t: Translate): string | null {
  if (!analysis.bulkRanking) {
    return null;
  }
  return `${t('overlay.defense')}: ${t(`bulkTier.${analysis.bulkRanking.tier}`)}`;
}

// The overlay's "full result" body: species header, best PvP league, bulk tier, and a closing
// tip line (either the rule-based suggestion or, once it arrives, the AI's answer). Reads as a
// compact version of the same result card OverlayDemoScreen itself shows.
function formatOverlayBody(analysis: ScreenshotAnalysis, t: Translate, tip: string | undefined): string {
  const lines = [formatOverlayHeader(analysis)];
  const pvpLine = formatPvpLine(analysis, t);
  if (pvpLine) {
    lines.push(pvpLine);
  }
  const bulkLine = formatBulkLine(analysis, t);
  if (bulkLine) {
    lines.push(bulkLine);
  }
  if (tip) {
    lines.push(tip);
  }
  return lines.join('\n');
}

function formatOverlayText(analysis: ScreenshotAnalysis, t: Translate): string {
  if (!analysis.species) {
    return t('overlay.liveOverlaySearching');
  }
  return formatOverlayBody(analysis, t, analysis.suggestions[0]);
}

function truncateForOverlay(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= OVERLAY_AI_TIP_MAX_CHARS) {
    return trimmed;
  }
  return `${trimmed.slice(0, OVERLAY_AI_TIP_MAX_CHARS).trimEnd()}…`;
}

export function OverlayDemoScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [status, setStatus] = useState<Status>('idle');
  const [analysis, setAnalysis] = useState<ScreenshotAnalysis | null>(null);

  const [aiContext, setAiContext] = useState<CompanionAiContext>('general');
  const [aiState, setAiState] = useState<AiState>('idle');
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [overlayPermission, setOverlayPermission] = useState<boolean | null>(null);
  const [captureConsent, setCaptureConsent] = useState<'idle' | 'checking' | 'granted' | 'denied'>('idle');
  const [liveOverlayState, setLiveOverlayState] = useState<LiveOverlayState>('idle');

  // Tapping the floating overlay while it's live should open Professor Mode for a deeper answer
  // about whatever it's currently showing -- works even while PTC is backgrounded, since the
  // native side brings the app back to the foreground before firing this event.
  useEffect(() => onOverlayTapped(() => navigation.navigate('ProfessorChat')), [navigation]);

  // Species the AI has already been asked about during this live-overlay session -- a ref, not
  // state, because it's only read/written inside the tick loop below and must never trigger a
  // re-render (that would restart the effect and cancel an in-flight AI request).
  const aiTipSpeciesIdRef = useRef<number | null>(null);

  // The live-overlay loop itself runs natively (ScreenCaptureService.kt's startPolling) so it keeps
  // firing while PTC is backgrounded and the trainer is looking at the actual game -- a JS
  // setInterval reliably stalls once its owning Activity loses foreground, which defeated the
  // whole point of an always-on overlay. This listener just reacts to each native tick's already-
  // recognized text: run it through the exact same analysis pipeline as the gallery-picker flow,
  // and push a "species · CP · IV · tip" summary into the floating window. The first time a
  // species is newly recognized, that rule-based summary shows immediately, then gets upgraded to
  // a real Gemini-generated tip once it comes back -- the AI is only called once per species, not
  // every tick, to keep things cheap and fast.
  useEffect(() => {
    if (liveOverlayState !== 'active') {
      return;
    }
    return onOverlayFrameText((rawText) => {
      const nextAnalysis = analyzeOcrText(rawText);
      setAnalysis(nextAnalysis);
      setStatus('idle');

      if (!nextAnalysis.species) {
        aiTipSpeciesIdRef.current = null;
        updateOverlayText(t('overlay.liveOverlaySearching'));
        return;
      }

      if (nextAnalysis.species.id === aiTipSpeciesIdRef.current) {
        // Already showing an AI tip (or trying to fetch one) for this species -- leave it be.
        return;
      }

      const speciesId = nextAnalysis.species.id;
      aiTipSpeciesIdRef.current = speciesId;
      updateOverlayText(formatOverlayText(nextAnalysis, t));

      fetchCompanionSuggestion(speciesId, 'general', buildCompanionExtraContext(nextAnalysis))
        .then((aiTip) => {
          // The trainer may have moved to a different Pokemon while this request was in flight.
          if (aiTipSpeciesIdRef.current !== speciesId) {
            return;
          }
          return updateOverlayText(formatOverlayBody(nextAnalysis, t, truncateForOverlay(aiTip)));
        })
        .catch(() => {
          // No LLM configured / request failed -- the rule-based text already shown stays put.
        });
    });
  }, [liveOverlayState, t]);

  async function handleStartLiveOverlay(): Promise<void> {
    setLiveOverlayState('starting');
    let consentGranted = captureConsent === 'granted';
    if (!consentGranted) {
      setCaptureConsent('checking');
      consentGranted = await requestScreenCapturePermission();
      setCaptureConsent(consentGranted ? 'granted' : 'denied');
    }
    if (!consentGranted) {
      setLiveOverlayState('idle');
      return;
    }
    const captureStarted = await startLiveCapture();
    const shown = captureStarted && (await showTestOverlay());
    if (!shown) {
      setLiveOverlayState('idle');
      return;
    }
    await updateOverlayText(t('overlay.liveOverlaySearching'));
    setLiveOverlayState('active');
  }

  async function handleStopLiveOverlay(): Promise<void> {
    setLiveOverlayState('idle');
    aiTipSpeciesIdRef.current = null;
    await hideTestOverlay();
    await stopLiveCapture();
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

  async function runAnalysis(uri: string): Promise<void> {
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

  async function handlePickImage(): Promise<void> {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      return;
    }
    await runAnalysis(uri);
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

            {overlayPermission === true && liveOverlayState === 'idle' && (
              <Pressable
                style={styles.askAiButton}
                onPress={handleStartLiveOverlay}
                accessibilityRole="button"
                accessibilityLabel={t('overlay.startLiveOverlayButton')}
              >
                <Text style={styles.askAiButtonText}>{t('overlay.startLiveOverlayButton')}</Text>
              </Pressable>
            )}

            {liveOverlayState === 'starting' && (
              <View style={styles.askAiButton}>
                <ActivityIndicator size="small" color={COLORS.surface} />
              </View>
            )}

            {liveOverlayState === 'active' && (
              <>
                <Text style={styles.sectionText}>{t('overlay.liveOverlayActive')}</Text>
                <Pressable
                  style={[styles.askAiButton, styles.stopLiveCaptureButton]}
                  onPress={handleStopLiveOverlay}
                  accessibilityRole="button"
                  accessibilityLabel={t('overlay.stopLiveOverlayButton')}
                >
                  <Text style={styles.askAiButtonText}>{t('overlay.stopLiveOverlayButton')}</Text>
                </Pressable>
              </>
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
  stopLiveCaptureButton: {
    backgroundColor: COLORS.danger,
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
