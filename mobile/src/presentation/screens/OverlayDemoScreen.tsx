import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { calculateIvPercentage } from '../../domain/iv-calculator';
import { formatMoveName, getMetaTier, META_TIER_LABELS, PVP_LEAGUE_LABELS, PvpLeague } from '../../domain/pvp';
import { BULK_TIER_LABELS } from '../../use-cases/rankBulkPercentile';
import { analyzeScreenshot, ScreenshotAnalysis } from '../../use-cases/analyzeScreenshot';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../theme';

const LEAGUE_ORDER: PvpLeague[] = ['great', 'ultra', 'master'];

type Status = 'idle' | 'loading' | 'error';

export function OverlayDemoScreen(): React.JSX.Element {
  const [status, setStatus] = useState<Status>('idle');
  const [analysis, setAnalysis] = useState<ScreenshotAnalysis | null>(null);

  async function handlePickImage(): Promise<void> {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      return;
    }

    setStatus('loading');
    try {
      const nextAnalysis = await analyzeScreenshot(uri);
      setAnalysis(nextAnalysis);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Overlay Demo</Text>
        <Text style={styles.subtitle}>
          Pick a status-screen screenshot — the same on-device OCR the real floating overlay will
          use reads the species name, CP, and HP, then every calculator in this app runs on the
          result. No login, no game memory access; see docs/legal-compliance.md.
        </Text>

        <Pressable style={({ pressed }) => [styles.pickButton, pressed && styles.pickButtonPressed]} onPress={handlePickImage}>
          <Text style={styles.pickButtonText}>Pick a screenshot</Text>
        </Pressable>

        {status === 'loading' && <ActivityIndicator style={styles.spinner} size="large" color={COLORS.brandBlue} />}

        {status === 'error' && (
          <Text style={styles.errorText}>Couldn't read that image. Try a clearer screenshot.</Text>
        )}

        {analysis && status === 'idle' && (
          <View style={styles.overlayCardWrapper}>
            <Card accentColor={COLORS.brandBlue}>
              <Text style={styles.overlayLabel}>OVERLAY RESULT</Text>

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
                      {analysis.ivMatches.length > 1 ? ` — +${analysis.ivMatches.length - 1} more match` : ''}
                    </Text>
                  ) : (
                    <Text style={styles.sectionText}>IV: couldn't match CP/HP to a level 1-40.</Text>
                  )}

                  {LEAGUE_ORDER.filter((league) => analysis.pvpRankings?.[league] !== undefined).map((league) => {
                    const moveset = analysis.pvpRankings![league]!;
                    return (
                      <Text key={league} style={styles.sectionText}>
                        {PVP_LEAGUE_LABELS[league]}: {formatMoveName(moveset.fastMove)} +{' '}
                        {moveset.chargedMoves.map(formatMoveName).join(' / ')} (
                        {META_TIER_LABELS[getMetaTier(moveset.score)]})
                      </Text>
                    );
                  })}

                  {analysis.bulkRanking && (
                    <Text style={styles.sectionText}>
                      Defense: {BULK_TIER_LABELS[analysis.bulkRanking.tier]}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.sectionText}>
                  Couldn't recognize a known species name in this image.
                </Text>
              )}

              <Text style={styles.rawTextLabel}>Raw OCR text (for debugging)</Text>
              <Text style={styles.rawText}>{analysis.rawText || '(empty)'}</Text>
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
