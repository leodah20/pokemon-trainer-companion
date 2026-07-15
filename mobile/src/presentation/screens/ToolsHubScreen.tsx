import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, SPACING } from '../theme';
import { TabScreenProps } from '../navigation/types';

type Props = TabScreenProps<'Tools'>;

interface ToolEntry {
  emoji: string;
  title: string;
  description: string;
  onPress: (navigation: Props['navigation']) => void;
}

const TOOLS: readonly ToolEntry[] = [
  {
    emoji: '🧮',
    title: 'IV Calculator',
    description: 'Enter CP and HP to find the possible IV combinations for a Pokemon.',
    onPress: (navigation) => navigation.navigate('IvCalculator'),
  },
  {
    emoji: '⚖️',
    title: 'Compare',
    description: 'Put two Pokemon side by side and see who wins each stat.',
    onPress: (navigation) => navigation.navigate('Comparison'),
  },
  {
    emoji: '🔥',
    title: 'Type Chart',
    description: 'Pick an attacking type and see everything it’s strong or weak against.',
    onPress: (navigation) => navigation.navigate('TypeChart'),
  },
  {
    emoji: '⚔️',
    title: 'Raid Counters',
    description: 'Pick a raid boss and see the top estimated counters, with weather boosts.',
    onPress: (navigation) => navigation.navigate('RaidCounters'),
  },
];

export function ToolsHubScreen({ navigation }: Props): React.JSX.Element {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tools</Text>
        <Text style={styles.subtitle}>Calculators and reference tools for battle prep.</Text>

        {TOOLS.map((tool) => (
          <Pressable key={tool.title} onPress={() => tool.onPress(navigation)}>
            <Card style={styles.card} accentColor={COLORS.brandBlue}>
              <View style={styles.cardRow}>
                <Text style={styles.emoji}>{tool.emoji}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{tool.title}</Text>
                  <Text style={styles.cardDescription}>{tool.description}</Text>
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
