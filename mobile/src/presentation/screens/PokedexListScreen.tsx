import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { PokemonSpecies } from '../../domain/pokemon-species';
import { getAllGenerations, getAllSpecies, getAllTypes, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { COLORS, DISPLAY_FONT, FONT_SIZE, getTypeColor, Logo, RADIUS, SHADOW, SPACING, tintTowardWhite, TypeBadge } from '../theme';
import { EMPTY_POKEDEX_FILTERS, filterPokedex, PokedexFilters } from '../../use-cases/filterPokedex';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Pokedex'>;

const ALL_SPECIES = getAllSpecies();
const ALL_GENERATIONS = getAllGenerations();
const ALL_TYPES = getAllTypes();

/** How much the scrolling background tint leans toward white — low on purpose, this app is colorful. */
const BACKGROUND_TINT_WHITE_RATIO = 0.6;
const BACKGROUND_TRANSITION_MS = 700;

function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function PokedexListScreen({ navigation, route }: Props): React.JSX.Element {
  const pickerMode = route.params?.pickerMode ?? false;
  const [filters, setFilters] = useState<PokedexFilters>(EMPTY_POKEDEX_FILTERS);

  const results = useMemo(() => filterPokedex(ALL_SPECIES, filters), [filters]);

  const colorProgress = useRef(new Animated.Value(0)).current;
  const [backgroundTint, setBackgroundTint] = useState<{ from: string; to: string }>({
    from: COLORS.background,
    to: COLORS.background,
  });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems[0]?.item as PokemonSpecies | undefined;
      if (!firstVisible) {
        return;
      }
      const nextTint = tintTowardWhite(getTypeColor(firstVisible.types[0]), BACKGROUND_TINT_WHITE_RATIO);
      setBackgroundTint((prev) => {
        if (prev.to === nextTint) {
          return prev;
        }
        colorProgress.setValue(0);
        Animated.timing(colorProgress, {
          toValue: 1,
          duration: BACKGROUND_TRANSITION_MS,
          useNativeDriver: false, // color interpolation isn't supported by the native driver
        }).start();
        return { from: prev.to, to: nextTint };
      });
    },
  ).current;

  const animatedBackgroundColor = colorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [backgroundTint.from, backgroundTint.to],
  });

  function handleSelect(species: PokemonSpecies): void {
    if (pickerMode) {
      navigation.navigate('IvCalculator', { speciesId: species.id });
    } else {
      navigation.navigate('PokemonDetail', { speciesId: species.id });
    }
  }

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: animatedBackgroundColor }]} />
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {pickerMode ? (
          <Text style={styles.title}>Choose a Pokemon</Text>
        ) : (
          <View style={styles.logoRow}>
            <Logo />
          </View>
        )}

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

        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          initialNumToRender={16}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, SHADOW.sm, pressed && styles.rowPressed]}
              onPress={() => handleSelect(item)}
            >
              <View
                style={[
                  styles.spriteBackdrop,
                  { backgroundColor: `${getTypeColor(item.types[0])}55`, borderColor: getTypeColor(item.types[0]) },
                ]}
              >
                <Image source={{ uri: getSpriteUrl(item.id) }} style={styles.sprite} resizeMode="contain" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowDexNumber}>{formatDexNumber(item.id)}</Text>
                <Text style={styles.rowName}>{item.name}</Text>
                <View style={styles.rowTypes}>
                  {item.types.map((type) => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </View>
              </View>
            </Pressable>
          )}
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
      style={[styles.chip, selected && { backgroundColor: color ?? COLORS.brandRed, borderColor: color ?? COLORS.brandRed }]}
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
    backgroundColor: 'transparent',
  },
  logoRow: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.xl,
    color: COLORS.brandRed,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  search: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2.5,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    ...SHADOW.sm,
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
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md + 2,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.textPrimary,
    fontWeight: '700',
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
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.outline,
    padding: SPACING.sm,
  },
  rowPressed: {
    opacity: 0.85,
  },
  spriteBackdrop: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprite: {
    width: 44,
    height: 44,
  },
  rowInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  rowDexNumber: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  rowName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  rowTypes: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textSecondary,
  },
});
