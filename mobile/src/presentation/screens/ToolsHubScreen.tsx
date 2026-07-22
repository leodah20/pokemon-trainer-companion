import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, RETRO_FONT, SPACING } from '../theme';
import { TabScreenProps } from '../navigation/types';
import { TranslationKeys, useTranslation } from '../../i18n';

type Props = TabScreenProps<'Tools'>;

interface ToolEntry {
  emoji: string;
  titleKey: keyof TranslationKeys;
  descriptionKey: keyof TranslationKeys;
  onPress: (navigation: Props['navigation']) => void;
}

const TOOLS: readonly ToolEntry[] = [
  {
    emoji: '🧮',
    titleKey: 'tools.ivCalculator.title',
    descriptionKey: 'tools.ivCalculator.description',
    onPress: (navigation) => navigation.navigate('IvCalculator'),
  },
  {
    emoji: '⚖️',
    titleKey: 'tools.compare.title',
    descriptionKey: 'tools.compare.description',
    onPress: (navigation) => navigation.navigate('Comparison'),
  },
  {
    emoji: '🔥',
    titleKey: 'tools.typeChart.title',
    descriptionKey: 'tools.typeChart.description',
    onPress: (navigation) => navigation.navigate('TypeChart'),
  },
  {
    emoji: '⚔️',
    titleKey: 'tools.raidCounters.title',
    descriptionKey: 'tools.raidCounters.description',
    onPress: (navigation) => navigation.navigate('RaidCounters'),
  },
];

export function ToolsHubScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{t('tools.eyebrow')}</Text>
        <Text style={styles.title}>{t('tools.title')}</Text>
        <Text style={styles.subtitle}>{t('tools.subtitle')}</Text>

        {TOOLS.map((tool) => (
          <Pressable
            key={tool.titleKey}
            onPress={() => tool.onPress(navigation)}
            accessibilityRole="button"
            accessibilityLabel={t(tool.titleKey)}
            accessibilityHint={t(tool.descriptionKey)}
          >
            <Card style={styles.card} accentColor={COLORS.phosphorDim} backgroundColor={COLORS.inkPanel}>
              <View style={styles.cardRow}>
                <View style={styles.emojiWell}>
                  <Text style={styles.emoji}>{tool.emoji}</Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>
                    <Text style={styles.prompt}>{'> '}</Text>
                    {t(tool.titleKey)}
                  </Text>
                  <Text style={styles.cardDescription}>{t(tool.descriptionKey)}</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.inkBlack,
  },
  content: {
    padding: SPACING.lg,
  },
  eyebrow: {
    fontFamily: RETRO_FONT,
    fontSize: 9,
    color: COLORS.phosphor,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.xl,
    color: COLORS.inkText,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.inkTextMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emojiWell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.phosphorDim,
    backgroundColor: COLORS.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  cardText: {
    flex: 1,
  },
  prompt: {
    color: COLORS.phosphor,
    fontWeight: '800',
  },
  cardTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.inkText,
  },
  cardDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.inkTextMuted,
    marginTop: 2,
  },
});
