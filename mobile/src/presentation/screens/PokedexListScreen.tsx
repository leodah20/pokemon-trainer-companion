import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PokemonSpecies } from '../../domain/pokemon-species';
import { getAllGenerations, getAllSpecies, getAllTypes, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { COLORS, FONT_SIZE, getTypeColor, PIXEL_FONT, TypeBadge } from '../theme';
import { EMPTY_POKEDEX_FILTERS, filterPokedex, PokedexFilters } from '../../use-cases/filterPokedex';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Pokedex'>;

const ALL_SPECIES = getAllSpecies();
const ALL_GENERATIONS = getAllGenerations();
const ALL_TYPES = getAllTypes();

function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function PokedexListScreen({ navigation, route }: Props): React.JSX.Element {
  const pickerMode = route.params?.pickerMode ?? false;
  const [filters, setFilters] = useState<PokedexFilters>(EMPTY_POKEDEX_FILTERS);

  const results = useMemo(() => filterPokedex(ALL_SPECIES, filters), [filters]);

  function handleSelect(species: PokemonSpecies): void {
    if (pickerMode) {
      navigation.navigate('IvCalculator', { speciesId: species.id });
    } else {
      navigation.navigate('PokemonDetail', { speciesId: species.id });
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>{pickerMode ? 'Choose a Pokemon' : 'Pokedex'}</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by name"
        placeholderTextColor={COLORS.navyLight}
        value={filters.searchText}
        onChangeText={(text) => setFilters((prev) => ({ ...prev, searchText: text }))}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
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
        initialNumToRender={16}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => handleSelect(item)}>
            <Image source={{ uri: getSpriteUrl(item.id) }} style={styles.sprite} resizeMode="contain" />
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
      style={[
        styles.chip,
        selected && { backgroundColor: color ?? COLORS.pokedexRed },
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  title: {
    fontFamily: PIXEL_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.pokedexRed,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  search: {
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  filterRow: {
    marginTop: 10,
    paddingLeft: 16,
    flexGrow: 0,
  },
  chip: {
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  chipText: {
    fontSize: 11,
    color: COLORS.ink,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  list: {
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sprite: {
    width: 48,
    height: 48,
  },
  rowInfo: {
    marginLeft: 12,
    flex: 1,
  },
  rowDexNumber: {
    fontSize: 11,
    color: COLORS.navyLight,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
  },
  rowTypes: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.navyLight,
  },
});
