import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LoreEntry } from '../../domain/lore';
import { COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SPACING } from '../theme';

type LoreTab = 'timeline' | 'curiosities';

interface LoreSectionProps {
  lore: LoreEntry | undefined;
}

/**
 * Always shows the one-line summary first — the trainer decides from there whether to open the
 * Timeline/Curiosities tabs, instead of every species dumping a wall of text up front.
 */
export function LoreSection({ lore }: LoreSectionProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<LoreTab>('timeline');

  if (!lore) {
    return <Text style={styles.emptyText}>No lore written for this species yet.</Text>;
  }

  return (
    <View>
      <Text style={styles.summary}>{lore.summary}</Text>

      <Pressable style={styles.toggleButton} onPress={() => setExpanded((prev) => !prev)}>
        <Text style={styles.toggleButtonText}>{expanded ? 'Show less ▴' : 'Learn more ▾'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.expandedArea}>
          <View style={styles.tabRow}>
            <TabButton label="Timeline" active={activeTab === 'timeline'} onPress={() => setActiveTab('timeline')} />
            <TabButton
              label="Curiosities"
              active={activeTab === 'curiosities'}
              onPress={() => setActiveTab('curiosities')}
            />
          </View>

          {activeTab === 'timeline'
            ? lore.timeline.map((event, index) => (
                <View key={index} style={styles.timelineRow}>
                  <Text style={styles.timelineLabel}>{event.label}</Text>
                  <Text style={styles.timelineNote}>{event.note}</Text>
                </View>
              ))
            : lore.curiosities.map((fact, index) => (
                <Text key={index} style={styles.curiosityText}>
                  • {fact}
                </Text>
              ))}
        </View>
      )}
    </View>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function TabButton({ label, active, onPress }: TabButtonProps): React.JSX.Element {
  return (
    <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={active ? styles.tabTextActive : styles.tabText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  toggleButton: {
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.brandBlue,
  },
  expandedArea: {
    marginTop: SPACING.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tabButton: {
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
  },
  tabButtonActive: {
    backgroundColor: COLORS.success,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tabTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.surface,
  },
  timelineRow: {
    marginBottom: SPACING.sm,
  },
  timelineLabel: {
    fontFamily: DISPLAY_FONT,
    fontSize: 13,
    color: COLORS.brandRed,
  },
  timelineNote: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    marginTop: 2,
    lineHeight: 19,
  },
  curiosityText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 19,
  },
});
