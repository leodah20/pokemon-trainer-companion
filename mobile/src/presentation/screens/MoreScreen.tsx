import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SPACING } from '../theme';
import { TabScreenProps } from '../navigation/types';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, useTranslation } from '../../i18n';

type Props = TabScreenProps<'More'>;

export function MoreScreen({ navigation }: Props): React.JSX.Element {
  const { t, language, setLanguage } = useTranslation();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('more.title')}</Text>

        <Pressable onPress={() => navigation.navigate('OverlayDemo')}>
          <Card style={styles.card} accentColor={COLORS.brandGold}>
            <View style={styles.cardRow}>
              <Text style={styles.emoji}>📡</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{t('more.overlayDemo.title')}</Text>
                <Text style={styles.cardDescription}>{t('more.overlayDemo.description')}</Text>
              </View>
            </View>
          </Card>
        </Pressable>

        <Card style={styles.card} accentColor={COLORS.brandBlue}>
          <Text style={styles.languageLabel}>{t('more.language')}</Text>
          <View style={styles.languageRow}>
            {SUPPORTED_LANGUAGES.map((option) => (
              <Pressable
                key={option}
                style={[styles.languageChip, option === language && styles.languageChipSelected]}
                onPress={() => setLanguage(option)}
              >
                <Text style={[styles.languageChipText, option === language && styles.languageChipTextSelected]}>
                  {LANGUAGE_LABELS[option]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Text style={styles.footer}>{t('more.footer')}</Text>
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
  languageLabel: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  languageChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassSurface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  languageChipSelected: {
    backgroundColor: COLORS.brandBlue,
    borderColor: COLORS.brandBlue,
  },
  languageChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  languageChipTextSelected: {
    color: COLORS.surface,
  },
  footer: {
    marginTop: SPACING.xl,
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
