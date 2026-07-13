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
  Logo,
  RADIUS,
  SPACING,
  tintTowardWhite,
  TypeBadge,
} from '../theme';
import { EMPTY_POKEDEX_FILTERS, filterPokedex, PokedexFilters } from '../../use-cases/filterPokedex';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Pokedex'>;

const ALL_SPECIES = getAllSpecies();
const ALL_GENERATIONS = getAllGenerations();
const ALL_TYPES = getAllTypes();

const BACKGROUND_TRANSITION_MS = 600;
const DEFAULT_GRADIENT = getTypeGradient(getTypeColor(ALL_SPECIES[0].types[0]));

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
        {pickerMode ? (
          <Text style={styles.title}>Choose a Pokemon</Text>
        ) : (
          <View style={styles.logoRow}>
            <Logo color={COLORS.surface} />
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
          renderItem={({ item }) => {
            const itemColor = getTypeColor(item.types[0]);
            return (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => handleSelect(item)}
              >
                <View style={[styles.spriteBackdrop, { backgroundColor: tintTowardWhite(itemColor, 0.55), borderColor: COLORS.outline }]}>
                  <Image source={{ uri: getSpriteUrl(item.id) }} style={styles.sprite} resizeMode="contain" />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowDexNumber}>#{String(item.id).padStart(3, '0')}</Text>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <View style={styles.rowTypes}>
                    {item.types.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </View>
                </View>
              </Pressable>
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
  logoRow: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
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
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: 13,
    lineHeight: 17,
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
