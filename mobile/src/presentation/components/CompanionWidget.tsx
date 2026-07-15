import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllSpecies, getSpeciesById, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { getLoreWithFallback } from '../../data/lore/loreRepository';
import { PokemonSpecies } from '../../domain/pokemon-species';
import { COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../theme';

const DEFAULT_COMPANION_ID = 25; // Pikachu — the iconic "pick a buddy" default
const BOUNCE_DISTANCE = 7;
const BOUNCE_DURATION_MS = 900;
const MAX_PICKER_RESULTS = 8;

interface DialogueEntry {
  label: string;
  text: string;
}

function buildDialogue(species: PokemonSpecies): DialogueEntry[] {
  const lore = getLoreWithFallback(species);
  return [
    { label: 'About', text: lore.origin },
    { label: 'In GO', text: lore.goRelevance },
    { label: 'Battle tip', text: lore.battleTip },
    { label: 'Fun fact', text: lore.easterEgg },
  ].filter((entry) => entry.text.trim().length > 0);
}

/**
 * The in-app "buddy companion" — a floating avatar (bottom-left, opposite the Quick Actions FAB)
 * with a speech bubble that cycles through lore/tips for the trainer's chosen favorite. Rendered
 * once at the App root so it floats over every screen, not just the Pokedex.
 *
 * Deliberately rule-based, not LLM-backed: every line comes from lore-data.json or its
 * procedural fallback, already bundled offline. See README's "Post-beta scope" for why a real
 * LLM + scraped knowledge base was scoped as a separate, later decision (cost, ToS, privacy).
 */
export function CompanionWidget(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [speciesId, setSpeciesId] = useState(DEFAULT_COMPANION_ID);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);

  const species = getSpeciesById(speciesId);
  const dialogue = useMemo(() => (species ? buildDialogue(species) : []), [species]);
  const currentLine = dialogue[dialogueIndex] ?? null;

  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: BOUNCE_DURATION_MS, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: BOUNCE_DURATION_MS, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  if (!species) {
    return <></>;
  }

  function handleAvatarPress(): void {
    if (bubbleVisible) {
      setBubbleVisible(false);
      return;
    }
    setDialogueIndex(0);
    setBubbleVisible(true);
  }

  function handleNextLine(): void {
    setDialogueIndex((prev) => (prev + 1) % Math.max(dialogue.length, 1));
  }

  function handlePickSpecies(next: PokemonSpecies): void {
    setSpeciesId(next.id);
    setDialogueIndex(0);
    setPickerVisible(false);
    setBubbleVisible(true);
  }

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 24 }]}>
      {bubbleVisible && currentLine && (
        <Pressable style={styles.bubble} onPress={handleNextLine}>
          <View style={styles.bubbleHeaderRow}>
            <Text style={styles.bubbleLabel}>{currentLine.label.toUpperCase()}</Text>
            <Pressable hitSlop={12} onPress={() => setBubbleVisible(false)}>
              <Text style={styles.bubbleClose}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.bubbleText}>{currentLine.text}</Text>
          <View style={styles.dotsRow}>
            {dialogue.map((entry, index) => (
              <View key={entry.label} style={[styles.dot, index === dialogueIndex && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.bubbleTail} />
        </Pressable>
      )}

      <View style={styles.avatarRow}>
        <Animated.View
          style={{ transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -BOUNCE_DISTANCE] }) }] }}
        >
          <Pressable
            style={styles.avatarButton}
            onPress={handleAvatarPress}
            onLongPress={() => setPickerVisible(true)}
            accessibilityLabel={`${species.name} companion, tap for tips, hold to change`}
          >
            <Image source={{ uri: getSpriteUrl(species.id) }} style={styles.avatarSprite} resizeMode="contain" />
          </Pressable>
        </Animated.View>
      </View>

      <CompanionPicker visible={pickerVisible} onClose={() => setPickerVisible(false)} onPick={handlePickSpecies} />
    </View>
  );
}

interface CompanionPickerProps {
  visible: boolean;
  onClose: () => void;
  onPick: (species: PokemonSpecies) => void;
}

function CompanionPicker({ visible, onClose, onPick }: CompanionPickerProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const allSpecies = useMemo(() => getAllSpecies(), []);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized === '') {
      return [];
    }
    return allSpecies.filter((s) => s.name.toLowerCase().includes(normalized)).slice(0, MAX_PICKER_RESULTS);
  }, [allSpecies, query]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.pickerBackdrop} onPress={onClose}>
        <Pressable style={styles.pickerCard} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.pickerTitle}>Choose your companion</Text>
          <TextInput
            style={styles.pickerInput}
            placeholder="Search by name"
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {results.map((s) => (
            <Pressable key={s.id} style={styles.pickerRow} onPress={() => onPick(s)}>
              <Image source={{ uri: getSpriteUrl(s.id) }} style={styles.pickerSprite} resizeMode="contain" />
              <Text style={styles.pickerRowText}>{s.name}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const AVATAR_SIZE = 56;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    alignItems: 'flex-start',
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatarButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
  },
  avatarSprite: {
    width: AVATAR_SIZE - 16,
    height: AVATAR_SIZE - 16,
  },
  bubble: {
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
    maxWidth: 260,
    backgroundColor: COLORS.glassSurface,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.md,
  },
  bubbleTail: {
    position: 'absolute',
    left: 18,
    bottom: -8,
    width: 14,
    height: 14,
    backgroundColor: COLORS.glassSurface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.glassBorder,
    transform: [{ rotate: '45deg' }],
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bubbleLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.mintDark,
  },
  bubbleClose: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  bubbleText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    lineHeight: 19,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: SPACING.sm,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.mint,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: COLORS.scrimBackdrop,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  pickerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: '70%',
    ...SHADOW.lg,
  },
  pickerTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  pickerInput: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerSprite: {
    width: 32,
    height: 32,
  },
  pickerRowText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});
