import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, SPACING } from '../theme';
import { TabScreenProps } from '../navigation/types';

type Props = TabScreenProps<'More'>;

export function MoreScreen({ navigation }: Props): React.JSX.Element {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>More</Text>

        <Pressable onPress={() => navigation.navigate('OverlayDemo')}>
          <Card style={styles.card} accentColor={COLORS.brandGold}>
            <View style={styles.cardRow}>
              <Text style={styles.emoji}>📡</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Overlay Demo</Text>
                <Text style={styles.cardDescription}>
                  Preview the on-screen overlay concept using a screenshot from your gallery.
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>

        <Text style={styles.footer}>Professor Dex — a fan-made Pokemon GO companion.</Text>
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
  footer: {
    marginTop: SPACING.xl,
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
