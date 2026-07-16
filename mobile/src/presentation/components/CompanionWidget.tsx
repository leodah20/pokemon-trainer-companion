import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllSpecies, getSpeciesById, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { getLoreWithFallback } from '../../data/lore/loreRepository';
import { CompanionApiError, fetchCompanionSuggestion } from '../../data/companion/companionApiClient';
import { PokemonSpecies } from '../../domain/pokemon-species';
import { COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../theme';
import { useTranslation, SupportedLanguage, TranslationKeys } from '../../i18n';

const DEFAULT_COMPANION_ID = 25; // Pikachu — the iconic "pick a buddy" default
const BOUNCE_DISTANCE = 7;
const BOUNCE_DURATION_MS = 900;
const MAX_PICKER_RESULTS = 8;
const AVATAR_SIZE = 56;
const DRAG_THRESHOLD = 6; // px of movement before a touch counts as a drag, not a tap
const SCREEN_MARGIN = 8;

interface DialogueEntry {
  label: string;
  text: string;
}

function buildDialogue(
  species: PokemonSpecies,
  language: SupportedLanguage,
  t: (key: keyof TranslationKeys) => string,
): DialogueEntry[] {
  const lore = getLoreWithFallback(species, language);
  return [
    { label: t('companion.dialogueAbout'), text: lore.origin },
    { label: t('companion.dialogueInGo'), text: lore.goRelevance },
    { label: t('companion.dialogueBattleTip'), text: lore.battleTip },
    { label: t('companion.dialogueFunFact'), text: lore.easterEgg },
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
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const [speciesId, setSpeciesId] = useState(DEFAULT_COMPANION_ID);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);

  // Draggable position — starts bottom-left (roughly where it used to be pinned), draggable
  // anywhere after that. A ref (kept in sync via Animated's listener) tracks the live value so
  // release-time clamping doesn't need to reach into Animated's private internals.
  const screen = useMemo(() => Dimensions.get('window'), []);
  const initialPosition = useRef({
    x: SCREEN_MARGIN + 12,
    y: screen.height - insets.bottom - 24 - AVATAR_SIZE,
  }).current;
  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  const currentPosition = useRef(initialPosition);
  useEffect(() => {
    const id = pan.addListener((value) => {
      currentPosition.current = value;
    });
    return () => pan.removeListener(id);
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD,
      onPanResponderGrant: () => {
        pan.setOffset(currentPosition.current);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const maxX = screen.width - AVATAR_SIZE - SCREEN_MARGIN;
        const maxY = screen.height - AVATAR_SIZE - SCREEN_MARGIN;
        const clampedX = Math.min(Math.max(currentPosition.current.x, SCREEN_MARGIN), maxX);
        const clampedY = Math.min(Math.max(currentPosition.current.y, SCREEN_MARGIN), maxY);
        Animated.spring(pan, { toValue: { x: clampedX, y: clampedY }, useNativeDriver: false, friction: 7 }).start();
      },
    }),
  ).current;

  const [aiState, setAiState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const species = getSpeciesById(speciesId);
  const baseDialogue = useMemo(
    () => (species ? buildDialogue(species, language, t) : []),
    [species, language, t],
  );
  const dialogue = useMemo(
    () => (aiText ? [...baseDialogue, { label: t('companion.dialogueAiTip'), text: aiText }] : baseDialogue),
    [baseDialogue, aiText, t],
  );
  const currentLine = dialogue[dialogueIndex] ?? null;

  useEffect(() => {
    setAiState('idle');
    setAiText(null);
    setAiError(null);
  }, [speciesId]);

  async function handleAskAi(): Promise<void> {
    if (!species || aiState === 'loading') {
      return;
    }
    setAiState('loading');
    setAiError(null);
    try {
      const suggestion = await fetchCompanionSuggestion(species.id, 'general');
      setAiText(suggestion);
      setAiState('idle');
      setDialogueIndex(baseDialogue.length); // jump to the new AI Tip page
    } catch (error) {
      setAiState('error');
      setAiError(error instanceof CompanionApiError ? error.message : 'Something went wrong.');
    }
  }

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
    <Animated.View style={[styles.wrapper, { transform: pan.getTranslateTransform() }]}>
      {bubbleVisible && currentLine && (
        <Pressable
          style={styles.bubble}
          onPress={handleNextLine}
          accessibilityRole="button"
          accessibilityLabel={currentLine.label}
          accessibilityHint={currentLine.text}
        >
          <View style={styles.bubbleHeaderRow}>
            <Text style={styles.bubbleLabel}>{currentLine.label.toUpperCase()}</Text>
            <Pressable
              hitSlop={12}
              onPress={() => setBubbleVisible(false)}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Text style={styles.bubbleClose}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.bubbleText}>{currentLine.text}</Text>
          <View style={styles.dotsRow}>
            {dialogue.map((entry, index) => (
              <View key={entry.label} style={[styles.dot, index === dialogueIndex && styles.dotActive]} />
            ))}
          </View>

          {aiState === 'error' && aiError && <Text style={styles.aiErrorText}>{aiError}</Text>}

          <Pressable
            style={styles.askAiButton}
            onPress={(event) => {
              event.stopPropagation();
              handleAskAi();
            }}
            disabled={aiState === 'loading'}
            accessibilityRole="button"
            accessibilityLabel={aiState === 'error' ? t('companion.retryAskAi') : aiText ? t('companion.askAgain') : t('companion.askAi')}
          >
            {aiState === 'loading' ? (
              <ActivityIndicator size="small" color={COLORS.mintDark} />
            ) : (
              <Text style={styles.askAiText}>
                {aiState === 'error' ? t('companion.retryAskAi') : aiText ? t('companion.askAgain') : t('companion.askAi')}
              </Text>
            )}
          </Pressable>

          <View style={styles.bubbleTail} />
        </Pressable>
      )}

      <View style={styles.avatarRow}>
        <Animated.View
          {...panResponder.panHandlers}
          style={{ transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -BOUNCE_DISTANCE] }) }] }}
        >
          <Pressable
            style={styles.avatarButton}
            onPress={handleAvatarPress}
            onLongPress={() => setPickerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`${species.name} companion, tap for tips, hold to change, drag to move`}
          >
            <Image source={{ uri: getSpriteUrl(species.id) }} style={styles.avatarSprite} resizeMode="contain" />
          </Pressable>
        </Animated.View>
      </View>

      <CompanionPicker visible={pickerVisible} onClose={() => setPickerVisible(false)} onPick={handlePickSpecies} />
    </Animated.View>
  );
}

interface CompanionPickerProps {
  visible: boolean;
  onClose: () => void;
  onPick: (species: PokemonSpecies) => void;
}

function CompanionPicker({ visible, onClose, onPick }: CompanionPickerProps): React.JSX.Element {
  const { t } = useTranslation();
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
      <Pressable style={styles.pickerBackdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.close')}>
        <Pressable style={styles.pickerCard} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.pickerTitle}>{t('companion.choosePrompt')}</Text>
          <TextInput
            style={styles.pickerInput}
            placeholder={t('companion.searchPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            accessibilityLabel={t('companion.searchPlaceholder')}
          />
          {results.map((s) => (
            <Pressable
              key={s.id}
              style={styles.pickerRow}
              onPress={() => onPick(s)}
              accessibilityRole="button"
              accessibilityLabel={s.name}
            >
              <Image source={{ uri: getSpriteUrl(s.id) }} style={styles.pickerSprite} resizeMode="contain" />
              <Text style={styles.pickerRowText}>{s.name}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
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
  aiErrorText: {
    marginTop: SPACING.sm,
    fontSize: 11,
    color: COLORS.danger,
  },
  askAiButton: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  askAiText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.mintDark,
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
