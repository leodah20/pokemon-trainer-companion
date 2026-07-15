import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewToken,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PokemonSpecies } from '../../domain/pokemon-species';
import { getAllGenerations, getAllSpecies, getAllTypes, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import {
  COLORS,
  DISPLAY_FONT,
  FONT_SIZE,
  getTypeColor,
  getTypeGradient,
  RADIUS,
  SPACING,
  tintTowardWhite,
  TypeBadge,
} from '../theme';
import { EMPTY_POKEDEX_FILTERS, filterPokedex, PokedexFilters } from '../../use-cases/filterPokedex';
import { TabScreenProps } from '../navigation/types';

type Props = TabScreenProps<'Pokedex'>;

const ALL_SPECIES = getAllSpecies();
const ALL_GENERATIONS = getAllGenerations();
const ALL_TYPES = getAllTypes();

const BACKGROUND_TRANSITION_MS = 600;
const DEFAULT_GRADIENT = getTypeGradient(getTypeColor(ALL_SPECIES[0].types[0]));

// Approximate height of one list row + its gap (sprite 60 + vertical padding 16 + list gap 12) —
// used only to estimate where each row sits for the scroll-fade effect below, not for layout.
const ROW_SLOT_HEIGHT = 88;
const FADE_DISTANCE = 90;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<PokemonSpecies>);

// RN's AnimatedInterpolation isn't accepted where LinearGradient expects plain colors,
// so the animated gradient is two stacked static gradients cross-fading via opacity.
export function PokedexListScreen({ navigation, route }: Props): React.JSX.Element {
  const pickerMode = route.params?.pickerMode ?? false;
  const [filters, setFilters] = useState<PokedexFilters>(EMPTY_POKEDEX_FILTERS);

  const results = useMemo(() => filterPokedex(ALL_SPECIES, filters), [filters]);

  const fadeProgress = useRef(new Animated.Value(1)).current;
  const [gradients, setGradients] = useState<{ from: [string, string]; to: [string, string] }>({
    from: DEFAULT_GRADIENT,
    to: DEFAULT_GRADIENT,
  });

  const scrollY = useRef(new Animated.Value(0)).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems[0]?.item as PokemonSpecies | undefined;
      if (!firstVisible) {
        return;
      }
      const nextGradient = getTypeGradient(getTypeColor(firstVisible.types[0]));
      setGradients((prev) => {
        if (prev.to[0] === nextGradient[0] && prev.to[1] === nextGradient[1]) {
          return prev;
        }
        fadeProgress.setValue(0);
        Animated.timing(fadeProgress, {
          toValue: 1,
          duration: BACKGROUND_TRANSITION_MS,
          useNativeDriver: true,
        }).start();
        return { from: prev.to, to: nextGradient };
      });
    },
  ).current;

  function handleSelect(species: PokemonSpecies): void {
    if (pickerMode) {
      navigation.navigate('IvCalculator', { speciesId: species.id });
    } else {
      navigation.navigate('PokemonDetail', { speciesId: species.id });
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.from} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeProgress }]}>
        <LinearGradient colors={gradients.to} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <Text style={styles.title}>{pickerMode ? 'Choose a Pokemon' : 'Pokedex'}</Text>

        <TextInput
          style={styles.search}
          placeholder="Search by name"
          placeholderTextColor={COLORS.textMuted}
          value={filters.searchText}
          onChangeText={(text) => setFilters((prev) => ({ ...prev, searchText: text }))}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          <FilterChip
            label="All gens"
            selected={filters.generation === null}
            onPress={() => setFilters((prev) => ({ ...prev, generation: null }))}
          />
          {ALL_GENERATIONS.map((gen) => (
            <FilterChip
              key={gen}
              label={`Gen ${gen}`}
              selected={filters.generation === gen}
              onPress={() =>
                setFilters((prev) => ({ ...prev, generation: prev.generation === gen ? null : gen }))
              }
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          <FilterChip
            label="All types"
            selected={filters.type === null}
            onPress={() => setFilters((prev) => ({ ...prev, type: null }))}
          />
          {ALL_TYPES.map((type) => (
            <FilterChip
              key={type}
              label={type}
              selected={filters.type === type}
              color={getTypeColor(type)}
              onPress={() => setFilters((prev) => ({ ...prev, type: prev.type === type ? null : type }))}
            />
          ))}
        </ScrollView>

        <AnimatedFlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          initialNumToRender={16}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          renderItem={({ item: species, index }) => {
            const itemColor = getTypeColor(species.types[0]);
            // Cards fade out as they scroll past the top of the list. The exit point is where
            // the item's bottom edge would align with the viewport top (index+1 row heights of
            // scroll) — using the item's own top (index * height) instead made item 0 start
            // pre-faded, since its top already sits at scrollY 0 before any scrolling happens.
            const itemExitPoint = (index + 1) * ROW_SLOT_HEIGHT;
            const opacity = scrollY.interpolate({
              inputRange: [itemExitPoint - FADE_DISTANCE, itemExitPoint],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View style={{ opacity }}>
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={() => handleSelect(species)}
                >
                  <View style={[styles.spriteBackdrop, { backgroundColor: tintTowardWhite(itemColor, 0.55), borderColor: COLORS.outline }]}>
                    <Image source={{ uri: getSpriteUrl(species.id) }} style={styles.sprite} resizeMode="contain" />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowDexNumber}>#{String(species.id).padStart(3, '0')}</Text>
                    <Text style={styles.rowName}>{species.name}</Text>
                    <View style={styles.rowTypes}>
                      {species.types.map((type) => (
                        <TypeBadge key={type} type={type} />
                      ))}
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No Pokemon match these filters.</Text>}
        />
      </SafeAreaView>
    </View>
  );
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

function FilterChip({ label, selected, onPress, color }: FilterChipProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color ?? COLORS.brandRed }]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.xl,
    color: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    textShadowColor: COLORS.outline,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  search: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 2.5,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  filterRow: {
    marginTop: SPACING.md,
    flexGrow: 0,
  },
  filterRowContent: {
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  chip: {
    flexShrink: 0,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    minHeight: 40,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '700',
    // No explicit lineHeight here on purpose — a value tighter than the font's natural box
    // clips ascenders/descenders on Android (that's what caused the cut-off chip labels).
  },
  chipTextSelected: {
    color: COLORS.surface,
  },
  list: {
    marginTop: SPACING.lg,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 2.5,
    borderColor: COLORS.outline,
    padding: SPACING.sm,
  },
  rowPressed: {
    transform: [{ scale: 0.98 }],
  },
  spriteBackdrop: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprite: {
    width: 48,
    height: 48,
  },
  rowInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  rowDexNumber: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  rowName: {
    fontSize: FONT_SIZE.lg,
    fontFamily: DISPLAY_FONT,
    color: COLORS.textPrimary,
  },
  rowTypes: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.surface,
    fontWeight: '700',
  },
});
