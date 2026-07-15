import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, SPACING } from '../theme';
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
        <Text style={styles.title}>{t('tools.title')}</Text>
        <Text style={styles.subtitle}>{t('tools.subtitle')}</Text>

        {TOOLS.map((tool) => (
          <Pressable key={tool.titleKey} onPress={() => tool.onPress(navigation)}>
            <Card style={styles.card} accentColor={COLORS.brandBlue}>
              <View style={styles.cardRow}>
                <Text style={styles.emoji}>{tool.emoji}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{t(tool.titleKey)}</Text>
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
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
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
  emoji: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  cardDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
